"use client";

import { Trophy, Star, Shield, Flame, Zap, Share2, Triangle, Crown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountingNumber } from "@/src/components/ui/CountingNumber";

interface UserData {
  uid: string;
  name: string;
  score: number;
  avatar: string;
  photoURL?: string | null;
  isMe?: boolean;
  prevRank?: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard?t=" + Date.now());
        const data = await res.json();
        if (data.success) {
          // Map API data to UserData interface
          const mapped = data.leaderboard.map((u: any) => {
            const isMe = u.uid === user?.uid;
            return {
              uid: u.uid,
              name: isMe && user?.displayName ? user.displayName : (u.name || "Sobat Evoca"),
              score: u.score,
              avatar: isMe && user?.displayName ? user.displayName.charAt(0).toUpperCase() : (u.avatar || "U"),
              photoURL: isMe && user?.photoURL ? user.photoURL : u.photoURL,
              isMe,
              prevRank: undefined
            };
          });
          setLeaderboard(mapped);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [user?.uid]);

  const sortedUsers = useMemo(() => {
    return [...leaderboard]
      .sort((a, b) => b.score - a.score)
      .map((u, index) => {
        const isMe = u.uid === user?.uid;
        const currentRank = index + 1;
        return {
          ...u,
          name: isMe && user?.displayName ? user.displayName : u.name,
          photoURL: isMe && user?.photoURL ? user.photoURL : u.photoURL,
          avatar: isMe && user?.displayName ? user.displayName.charAt(0).toUpperCase() : u.avatar,
          rank: currentRank,
          status: 'stable' as const,
          color: index === 0 ? "bg-amber-100 text-amber-600" :
            index === 1 ? "bg-stone-200 text-stone-600" :
              index === 2 ? "bg-orange-100 text-orange-600" :
                "bg-transparent text-stone-400"
        };
      });
  }, [leaderboard, user?.uid, user?.displayName, user?.photoURL]);

  const topThree = useMemo(() => {
    return [
      sortedUsers.find((u) => u.rank === 2),
      sortedUsers.find((u) => u.rank === 1),
      sortedUsers.find((u) => u.rank === 3),
    ].filter(Boolean) as UserData[];
  }, [sortedUsers]);

  const others = useMemo(() => {
    return sortedUsers.filter((u) => u.rank > 3);
  }, [sortedUsers]);

  const currentUser = useMemo(() => {
    const me = sortedUsers.find((u) => u.isMe);
    
    return {
      uid: user?.uid || "",
      name: user?.displayName || me?.name || "Sobat Evoca",
      score: me?.score || 0,
      avatar: (user?.displayName || me?.name || "U").charAt(0).toUpperCase(),
      photoURL: user?.photoURL || me?.photoURL,
      rank: me?.rank || "-",
      status: "stable" as const,
      isMe: true
    };
  }, [sortedUsers, user]);

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
            <div className="flex flex-col items-center flex-1 relative min-w-0">
              <div className="relative -mb-8 z-20">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 border-[#a78bfa] overflow-hidden relative shadow-lg shrink-0">
                  {topThree[0].photoURL ? (
                    <img src={topThree[0].photoURL} alt={topThree[0].name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-stone-100 flex items-center justify-center h-full w-full font-black text-purple-600 text-2xl">
                      {topThree[0].avatar}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-stone-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#8b5cf6]">
                  2
                </div>
              </div>
              <div className="w-full bg-[#a78bfa]/50 rounded-tl-[2rem] p-4 pt-10 text-center min-h-[120px] flex flex-col justify-center border-l border-t border-white/20 overflow-hidden min-w-0">
                <p className="text-white font-bold text-xs truncate mb-1 text-center w-full px-1">{topThree[0].name}</p>
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="text-white font-black text-sm">{topThree[0].score}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 - Center */}
          {topThree[1] && (
            <div className="flex flex-col items-center flex-1 relative z-30 min-w-0">
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

                <Crown className="w-10 h-10 text-amber-400 fill-amber-300 absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] z-30" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden relative z-20 shrink-0">
                  {topThree[1].photoURL ? (
                    <img src={topThree[1].photoURL} alt={topThree[1].name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-stone-100 flex items-center justify-center h-full w-full font-black text-purple-600 text-3xl">
                      {topThree[1].avatar}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-stone-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ring-4 ring-white/20 border-2 border-[#8b5cf6] z-30">
                  1
                </div>
              </div>
              <div className="w-full bg-[#c4b5fd] rounded-t-[2rem] p-4 pt-12 text-center min-h-[160px] flex flex-col justify-center shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] ring-1 ring-white/30 border-x border-t border-white/40 relative z-10 scale-105 origin-bottom">
                <p className="text-purple-950 font-black text-sm truncate mb-1 text-center w-full px-2">{topThree[1].name}</p>
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                  <span className="text-purple-900 font-black text-lg">{topThree[1].score}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 - Right */}
          {topThree[2] && (
            <div className="flex flex-col items-center flex-1 relative min-w-0">
              <div className="relative -mb-8 z-20">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 border-[#a78bfa] overflow-hidden relative shadow-lg shrink-0">
                  {topThree[2].photoURL ? (
                    <img src={topThree[2].photoURL} alt={topThree[2].name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-stone-100 flex items-center justify-center h-full w-full font-black text-purple-600 text-2xl">
                      {topThree[2].avatar}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-stone-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#8b5cf6]">
                  3
                </div>
              </div>
              <div className="w-full bg-[#a78bfa]/50 rounded-tr-[2rem] p-4 pt-10 text-center min-h-[80px] flex flex-col justify-center border-r border-t border-white/20">
                <p className="text-white font-bold text-xs truncate mb-1 text-center w-full px-2">{topThree[2].name}</p>
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
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
                  key={u.uid || u.rank.toString()}
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
                  <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    {/* Rank Indicator */}
                    <div className="flex items-center gap-1.5 min-w-[35px] sm:min-w-[45px] shrink-0">
                      <span className="font-black text-stone-900 text-lg md:text-xl tabular-nums">{u.rank}</span>
                      <AnimatePresence>
                        {u.status !== "stable" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: u.status === "up" ? 5 : -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={cn(
                              "flex items-center justify-center transition-all",
                              u.status === "up" ? "text-emerald-500" : "text-rose-500"
                            )}
                          >
                            <Triangle 
                              className={cn(
                                "w-3 h-3 fill-current", 
                                u.status === "down" && "rotate-180"
                              )} 
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-stone-100 overflow-hidden relative shadow-sm shrink-0">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-stone-100 h-full w-full flex items-center justify-center font-black text-stone-500 uppercase text-lg">
                            {u.avatar}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 pr-2">
                        <span className="font-bold text-stone-800 text-base md:text-xl flex items-center min-w-0">
                          <span className="truncate">{u.name}</span>
                          {u.isMe && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full ml-2 shrink-0">YOU</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3 bg-stone-50 px-5 py-2.5 rounded-2xl border border-stone-100 shadow-inner">
                    <Zap className="w-5 h-5 text-stone-400 fill-stone-300" />
                    <span className="font-black text-stone-900 text-lg md:text-xl">{u.score}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>


            {/* 3. Sticky User Bar - Moved inside Leaderboard List */}
            <div className="sticky bottom-0 left-0 w-full pt-10 px-0 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
              <div className="bg-[#ffaa00] text-purple-950 rounded-2xl p-2 flex items-center justify-between shadow-2xl relative border border-[#e69900]">
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  {/* My Rank */}
                  <div className="flex items-center gap-2 min-w-[40px] sm:min-w-[50px] relative px-2 shrink-0">
                    <span className="font-black text-stone-900 text-lg md:text-xl tabular-nums">
                      {currentUser.rank || "99+"}
                    </span>
                    <AnimatePresence>
                      {currentUser.status !== "stable" && (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.3, 1],
                            y: currentUser.status === "up" ? -2 : 2
                          }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={cn(
                            "flex items-center justify-center p-0.5 rounded-full bg-white/30",
                            currentUser.status === "up" ? "text-emerald-700" : "text-rose-700"
                          )}
                        >
                          <Triangle className={cn("w-3 h-3 fill-current", currentUser.status === "down" && "rotate-180")} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                  </div>

                  {/* My User Info */}
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-white/50 overflow-hidden relative shadow-md shrink-0">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="bg-indigo-600 h-full w-full flex items-center justify-center font-black text-white uppercase text-lg md:text-xl">
                          {currentUser.avatar}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className="font-extrabold text-stone-900 text-base md:text-xl truncate">{currentUser.name || "Kamu"}</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 md:gap-3 bg-white/40 px-4 md:px-5 py-2.5 rounded-2xl border border-white/30 shadow-inner shrink-0 ml-2">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-purple-950/80 fill-purple-950/60" />
                  <span className="font-black text-purple-950 text-xl md:text-2xl tabular-nums">
                    <CountingNumber value={currentUser.score || 0} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
