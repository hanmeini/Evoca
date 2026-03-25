"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { useRouter } from "next/navigation";

interface UserStats {
  gems: number;
  totalXP: number;
  streak: number;
  completedMissions: string[];
  dailyProgress?: {
    [date: string]: {
      messagesSent?: number;
      documentsUploaded?: number;
      quizzesPerfect?: number;
      podcastsFinished?: number;
    };
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userStats: UserStats;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userStats: { gems: 500, totalXP: 0, streak: 1, completedMissions: [] },
  signInWithGoogle: async () => {},
  logOut: async () => {},
  refreshStats: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    gems: 500,
    totalXP: 0,
    streak: 1,
    completedMissions: [],
  });
  const router = useRouter();

  const refreshStats = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user?userId=${user.uid}`);
      const data = await res.json();
      if (data.success && data.data) {
        setUserStats({
          gems: typeof data.data.gems === "number" ? data.data.gems : 500,
          totalXP:
            typeof data.data.totalXP === "number" ? data.data.totalXP : 0,
          streak: typeof data.data.streak === "number" ? data.data.streak : 1,
          completedMissions: Array.isArray(data.data.completedMissions)
            ? data.data.completedMissions
            : [],
          dailyProgress: data.data.dailyProgress || {},
        });
      }
    } catch (e) {
      console.error("Manual refresh failed:", e);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time listener for user stats
  useEffect(() => {
    if (!user) {
      setUserStats((prev) => {
        if (
          prev.totalXP === 0 &&
          prev.gems === 500 &&
          prev.streak === 1 &&
          prev.completedMissions.length === 0
        ) {
          return prev;
        }
        return { gems: 500, totalXP: 0, streak: 1, completedMissions: [] };
      });
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeStats = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUserStats({
            gems: typeof data.gems === "number" ? data.gems : 500,
            totalXP: typeof data.totalXP === "number" ? data.totalXP : 0,
            streak: typeof data.streak === "number" ? data.streak : 1,
            completedMissions: Array.isArray(data.completedMissions)
              ? data.completedMissions
              : [],
            dailyProgress: data.dailyProgress || {},
          });
        }
      },
      (error) => {
        console.warn(
          "Firestore Real-time failed (likely permissions):",
          error.message,
        );
        refreshStats();
      },
    );

    return () => unsubscribeStats();
  }, [user]);

  // Sync streak on login/load
  useEffect(() => {
    if (user) {
      fetch("/api/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        }),
      }).catch((err) => console.warn("Streak check failed:", err));
    }
  }, [user?.uid, user?.displayName, user?.photoURL]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userStats,
        signInWithGoogle,
        logOut,
        refreshStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
