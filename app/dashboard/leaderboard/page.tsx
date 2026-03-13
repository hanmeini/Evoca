"use client";

import { Trophy, Star, Shield, Flame, Crown, Share2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalXP: 0, rank: "-" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.uid) return;
      try {
        const res = await fetch(`/api/user-stats?userId=${user.uid}`);
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  // 1. Define Current User object first
  const myUser = {
    name: user?.displayName || "Sobat Evoca",
    score: stats.totalXP,
    avatar: user?.displayName?.charAt(0) || "U",
    photoURL: user?.photoURL,
    isMe: true // Flag to identify the user
  };

  // 2. Combine with Dummy Data
  const rawUsers = [
    { name: "Andi Saputra", score: 870, avatar: "A", prevRank: 1 },
    { name: "Budi Santoso", score: 115, avatar: "B", prevRank: 2 },
    { name: "Citra Lestari", score: 315, avatar: "C", prevRank: 3 },
    { name: "Dimas Anggara", score: 200, avatar: "D", prevRank: 4 },
    { name: "Eka Putri", score: 1020, avatar: "E", prevRank: 5 },
    { name: "Fajar Pratama", score: 2150, avatar: "F", prevRank: 6 },
    { name: "Gita Amalia", score: 20, avatar: "G", prevRank: 7 },
    { name: "Hendra Wijaya", score: 900, avatar: "H", prevRank: 8 },
    { name: "Indah Permata", score: 250, avatar: "I", prevRank: 9 },
    { name: "Joko Susilo", score: 175, avatar: "J", prevRank: 10 },
    { name: "Kristina", score: 55, avatar: "K", prevRank: 11 },
    { name: "Luthfi", score: 60, avatar: "L", prevRank: 12 },
    { name: "Maya", score: 10, avatar: "M", prevRank: 13 },
    { ...myUser, prevRank: 14 } // Let's assume user was rank 14 previously
  ];

  // 3. Sorting all users by score and assigning real rank
  const users = [...rawUsers]
    .sort((a, b) => b.score - a.score)
    .map((u, index) => {
      const currentRank = index + 1;
      const prevRank = (u as any).prevRank || currentRank;

      let status: 'up' | 'down' | 'stable' = 'stable';
      if (currentRank < prevRank) status = 'up';
      else if (currentRank > prevRank) status = 'down';

      return {
        isMe: false,
        photoURL: null,
        ...u,
        rank: currentRank,
        status,
        color: index === 0 ? "bg-amber-100 text-amber-600" :
          index === 1 ? "bg-stone-200 text-stone-600" :
            index === 2 ? "bg-orange-100 text-orange-600" :
              "bg-transparent text-stone-400"
      };
    });

  const topThree = [
    users.find(u => u.rank === 2),
    users.find(u => u.rank === 1),
    users.find(u => u.rank === 3),
  ].filter(Boolean);


  const others = users.filter(u => u.rank > 3);

  // 4. Update currentUser to use calculated rank
  const rankedMe = users.find(u => u.isMe);
  const currentUser = {
    ...myUser,
    rank: rankedMe?.rank || "-",
    status: rankedMe?.status || "stable",
    color: "bg-indigo-600 text-white",
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-stone-900 pb-0">
      {/* 1. Purple Header with Podium */}
      <div className="bg-[#8b5cf6] pt-8 pb-16 px-6 md:px-10 rounded-b-[4rem] relative overflow-hidden">
        {/* Header Title */}
        <div className="text-center md:text-left text-white mb-4 relative z-10 max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">Papan Peringkat</h1>
          <p className="text-purple-200 text-xs md:text-sm font-bold uppercase tracking-widest">Liga Global</p>
        </div>

        {/* Podium Pillars Section */}
        <div className="flex items-end justify-center max-w-2xl mx-auto relative z-10 pt-4 mt-7 h-60 px-2">
          {/* Rank 2 - Left */}
          {topThree[0] && (
            <div className="flex flex-col items-center flex-1 relative">
              <div className="relative -mb-8 z-20">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 border-[#a78bfa] overflow-hidden relative shadow-lg shrink-0">
                  <div className="bg-stone-100 flex items-center justify-center h-full w-full font-black text-purple-600 text-2xl">
                    {topThree[0].avatar}
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-stone-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#8b5cf6]">
                  2
                </div>
              </div>
              <div className="w-full bg-[#a78bfa]/50 rounded-tl-[2rem] p-4 pt-10 text-center min-h-[120px] flex flex-col justify-center border-l border-t border-white/20">
                <p className="text-white font-bold text-xs truncate mb-1 text-center">{topThree[0].name}</p>
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-white font-black text-sm">{topThree[0].score}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 - Center */}
          {topThree[1] && (
            <div className="flex flex-col items-center flex-1 relative z-30">
              <div className="relative -mb-10 z-20 -translate-y-4">
                {/* White Radiance / Sunburst Effect - Centered on Avatar */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 pointer-events-none -z-10">
                  <div
                    className="w-full h-full animate-[spin_25s_linear_infinite] opacity-30"
                    style={{
                      background: 'conic-gradient(from 0deg, white, transparent 15deg, white 30deg, transparent 45deg, white 60deg, transparent 75deg, white 90deg, transparent 105deg, white 120deg, transparent 135deg, white 150deg, transparent 165deg, white 180deg, transparent 195deg, white 210deg, transparent 225deg, white 240deg, transparent 255deg, white 270deg, transparent 285deg, white 300deg, transparent 315deg, white 330deg, transparent 345deg, white 360deg)',
                      maskImage: 'radial-gradient(circle, black 25%, transparent 70%)',
                      WebkitMaskImage: 'radial-gradient(circle, black 25%, transparent 70%)',
                    }}
                  />
                </div>

                <Crown className="w-10 h-10 text-amber-400 fill-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-lg z-30" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden relative z-20">
                  <div className="bg-stone-100 flex items-center justify-center h-full w-full font-black text-purple-600 text-3xl">
                    {topThree[1].avatar}
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-stone-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ring-4 ring-white/20 border-2 border-[#8b5cf6] z-30">
                  1
                </div>
              </div>
              <div className="w-full bg-[#c4b5fd] rounded-t-[2rem] p-4 pt-12 text-center min-h-[160px] flex flex-col justify-center shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] ring-1 ring-white/30 border-x border-t border-white/40 relative z-10 scale-105 origin-bottom">
                <p className="text-purple-950 font-black text-sm truncate mb-1 text-center">{topThree[1].name}</p>
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span className="text-purple-900 font-black text-lg">{topThree[1].score}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 - Right */}
          {topThree[2] && (
            <div className="flex flex-col items-center flex-1 relative">
              <div className="relative -mb-8 z-20">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 border-[#a78bfa] overflow-hidden relative shadow-lg shrink-0">
                  <div className="bg-stone-100 flex items-center justify-center h-full w-full font-black text-purple-600 text-2xl">
                    {topThree[2].avatar}
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-stone-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#8b5cf6]">
                  3
                </div>
              </div>
              <div className="w-full bg-[#a78bfa]/50 rounded-tr-[2rem] p-4 pt-10 text-center min-h-[80px] flex flex-col justify-center border-r border-t border-white/20">
                <p className="text-white font-bold text-xs truncate mb-1 text-center">{topThree[2].name}</p>
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-white font-black text-sm">{topThree[2].score}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. White List Container - Overlapping */}
      <div className="max-w-4xl mx-auto -mt-16 relative z-20 px-4">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-stone-100 flex flex-col">
          <div className="p-4 md:p-10 space-y-6 h-[50vh] md:h-[80vh] overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {others.map((u, idx) => (
                <motion.div
                  key={u.name}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  className={cn(
                    "flex items-center justify-between group p-2 rounded-2xl transition-all",
                    u.isMe && "bg-orange-50 border border-orange-200 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    {/* Rank Indicator */}
                    <div className="flex items-center gap-2 min-w-[50px]">
                      <span className="font-black text-stone-900 text-base md:text-lg">{u.rank}</span>
                      <div className={cn(
                        "w-3 h-3 flex items-center justify-center text-[10px] font-bold",
                        u.status === "up" ? "text-green-500" :
                          u.status === "down" ? "text-red-500" : "text-stone-300"
                      )}>
                        {u.status === "up" ? "▲" : u.status === "down" ? "▼" : "—"}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-stone-100 overflow-hidden relative shadow-sm shrink-0">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-stone-100 h-full w-full flex items-center justify-center font-black text-stone-500 uppercase text-lg">
                            {u.avatar}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-800 text-base md:text-xl">
                          {u.name} {u.isMe && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full ml-2">YOU</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3 bg-stone-50 px-5 py-2.5 rounded-2xl border border-stone-100 shadow-inner">
                    <Crown className="w-5 h-5 text-stone-400 fill-stone-300" />
                    <span className="font-black text-stone-900 text-lg md:text-xl">{u.score}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>


            {/* 3. Sticky User Bar - Moved inside Leaderboard List */}
            <div className="sticky bottom-0 left-0 w-full pt-10 px-0 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
              <div className="bg-[#ffaa00] text-purple-950 rounded-2xl p-2 flex items-center justify-between shadow-2xl relative border border-[#e69900]">
                <div className="flex items-center gap-4 md:gap-8">
                  {/* My Rank */}
                  <div className="flex items-center gap-2 min-w-[50px]">
                    <span className="font-black text-stone-900 text-base md:text-lg">{currentUser.rank === "-" ? "99+" : currentUser.rank}</span>
                    <div className={cn(
                      "w-3 h-3 flex items-center justify-center text-[10px] font-bold",
                      currentUser.status === "up" ? "text-green-600" :
                        currentUser.status === "down" ? "text-red-600" : "text-purple-900/40"
                    )}>
                      {currentUser.status === "up" ? "▲" : currentUser.status === "down" ? "▼" : "—"}
                    </div>
                  </div>

                  {/* My User Info */}
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-white/50 overflow-hidden relative shadow-md shrink-0">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="bg-indigo-600 h-full w-full flex items-center justify-center font-black text-white uppercase text-lg md:text-xl">
                          {currentUser.avatar}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-800 text-base md:text-xl">You</span>
                    </div>
                  </div>
                </div>

                {/* Score and Share */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 bg-white/40 px-5 py-2.5 rounded-2xl border border-white/30 shadow-inner">
                    <Crown className="w-5 h-5 text-purple-950/70 fill-purple-950/50" />
                    <span className="font-black text-purple-950 text-lg md:text-xl">{currentUser.score}</span>
                  </div>
                  <button className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md text-purple-950 rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/30 shrink-0">
                    <Share2 className="w-5 h-5 font-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
