"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { MascotType } from "../components/home/onboarding/types";

interface UserStats {
  gems: number;
  totalGemsEarned?: number;
  totalXP: number;
  streak: number;
  completedMissions: string[];
  totalDocs?: number;
  completedMissionsCount?: number;
  ownedMascots: string[];
  petLevels: { [mascotId: string]: number };
  selectedMascot: string;
  claimedDailyXP?: { [date: string]: boolean };
  dailyProgress?: {
    [date: string]: {
      messagesSent?: number;
      documentsUploaded?: number;
      quizzesPerfect?: number;
      podcastsFinished?: number;
    };
  };
  petFood?: number;
  petPlay?: number;
  petXP?: { [mascotId: string]: number };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userStats: UserStats;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshStats: () => Promise<void>;
  updateUserStats: (updates: Partial<UserStats>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userStats: { 
    gems: 500, 
    totalGemsEarned: 500,
    totalXP: 0, 
    streak: 1, 
    completedMissions: [],
    totalDocs: 0, 
    completedMissionsCount: 0,
    ownedMascots: ["tiger"],
    petLevels: { "tiger": 1 },
    selectedMascot: "tiger",
    petFood: 0,
    petPlay: 0,
    petXP: { "tiger": 0 }
  },
  signInWithGoogle: async () => {},
  logOut: async () => {},
  refreshStats: async () => {},
  updateUserStats: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>(() => {
    let initialMascot: any = "tiger";
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedMascot');
      if (saved) initialMascot = saved;
    }
    return {
      gems: 500,
      totalXP: 0,
      streak: 1,
      completedMissions: [],
      totalDocs: 0,
      completedMissionsCount: 0,
      ownedMascots: [initialMascot],
      petLevels: { [initialMascot]: 1 },
      selectedMascot: initialMascot,
      petFood: 0,
      petPlay: 0,
      petXP: { [initialMascot]: 0 }
    };
  });
  const router = useRouter();

  const updateUserStats = async (updates: Partial<UserStats>) => {
    if (!user) return;
    try {
      // Optimistic update
      setUserStats(prev => ({ ...prev, ...updates }));

      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, updates }),
      });
    } catch (e) {
      console.error("Failed to update user stats:", e);
      refreshStats(); // Revert on failure
    }
  };

  const refreshStats = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user?userId=${user.uid}`);
      const data = await res.json();
      if (data.success && data.data) {
        setUserStats({
          gems: typeof data.data.gems === "number" ? data.data.gems : 500,
          totalGemsEarned: typeof data.data.totalGemsEarned === "number" ? data.data.totalGemsEarned : (typeof data.data.gems === "number" ? data.data.gems : 500),
          totalXP: typeof data.data.totalXP === "number" ? data.data.totalXP : 0,
          streak: typeof data.data.streak === "number" ? data.data.streak : 1,
          completedMissions: Array.isArray(data.data.completedMissions)
            ? data.data.completedMissions
            : [],
          totalDocs: typeof data.data.totalDocs === "number" ? data.data.totalDocs : 0,
          completedMissionsCount: typeof data.data.completedMissionsCount === "number" ? data.data.completedMissionsCount : 0,
          ownedMascots: Array.isArray(data.data.ownedMascots) ? data.data.ownedMascots : ["tiger"],
          petLevels: data.data.petLevels || { "tiger": 1 },
          selectedMascot: data.data.selectedMascot || "tiger",
          dailyProgress: data.data.dailyProgress || {},
          petFood: data.data.petFood || 0,
          petPlay: data.data.petPlay || 0,
          petXP: data.data.petXP || { "tiger": 0 },
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
        return { 
          gems: 500, 
          totalGemsEarned: prev.totalGemsEarned ?? 500,
          totalXP: 0, 
          streak: 1, 
          completedMissions: [],
          totalDocs: 0,
          completedMissionsCount: 0,
          ownedMascots: ["tiger"],
          petLevels: { "tiger": 1 },
          selectedMascot: "tiger"
        };
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
            totalGemsEarned: typeof data.totalGemsEarned === "number" ? data.totalGemsEarned : (typeof data.gems === "number" ? data.gems : 500),
            totalXP: typeof data.totalXP === "number" ? data.totalXP : 0,
            streak: typeof data.streak === "number" ? data.streak : 1,
            completedMissions: Array.isArray(data.completedMissions)
              ? data.completedMissions
              : [],
            totalDocs: typeof data.totalDocs === "number" ? data.totalDocs : 0,
            completedMissionsCount: typeof data.completedMissionsCount === "number" ? data.completedMissionsCount : 0,
            ownedMascots: Array.isArray(data.ownedMascots) ? data.ownedMascots : [
              (typeof window !== 'undefined' ? localStorage.getItem('selectedMascot') : 'tiger') || 'tiger'
            ],
            petLevels: data.petLevels || { "tiger": 1 },
            selectedMascot: data.selectedMascot || "tiger",
            dailyProgress: data.dailyProgress || {},
            petFood: data.petFood || 0,
            petPlay: data.petPlay || 0,
            petXP: data.petXP || { [data.selectedMascot || "tiger"]: 0 },
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

  // Sync streak on login/load & persist mascot choice for new accounts
  useEffect(() => {
    if (user) {
      // Sync streak
      fetch("/api/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        }),
      }).catch((err) => console.warn("Streak check failed:", err));

      // Persist onboarding mascot to account if it's the first time
      const savedMascot = typeof window !== 'undefined' ? localStorage.getItem('selectedMascot') : null;
      if (savedMascot && 
          userStats.totalXP === 0 && 
          userStats.ownedMascots.length <= 1 && 
          userStats.selectedMascot !== savedMascot) {
        // Only update if the selection actually needs to change
        updateUserStats({
          selectedMascot: savedMascot as MascotType,
          ownedMascots: [savedMascot],
          petLevels: { [savedMascot]: 1 }
        });
      }
    }
  }, [user, userStats.ownedMascots, userStats.totalXP, userStats.selectedMascot]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === "auth/popup-blocked") {
        console.warn("Popup blocked, falling back to redirect...");
        await signInWithRedirect(auth, googleProvider);
      } else if (error.code === "auth/cancelled-popup-request") {
        console.log("Previous popup request cancelled.");
      } else if (error.code === "auth/popup-closed-by-user") {
        console.log("Popup closed by user.");
      } else {
        console.error("Error signing in with Google:", error);
        throw error;
      }
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
        updateUserStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
