"use client";

import { useState, useEffect, useMemo } from "react";
import { cn, getTodayStr } from "@/src/lib/utils";
import { PathNode } from "@/src/components/reader/PathNode";

import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { CountingNumber } from "@/src/components/ui/CountingNumber";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, BookOpen, Trophy, Flame, Zap, Gift, ChevronLeft } from "lucide-react";
import { UNITS } from "@/src/constants/units";

interface LeaderboardUser {
  uid: string;
  name: string;
  score: number;
  photoURL?: string;
  avatar: string;
}

interface DocumentHistory {
  id: string;
  fileName: string;
  fileUrl?: string; // Added to fix TS error
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  quizData?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  };
  podcastScript?: {
    lines: Array<{
      speaker: string;
      text: string;
    }>;
  };
  chatHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  metadata?: {
    title?: string;
    summary?: string;
  };
  completedStages?: string[];
}

const calculateProgress = (doc: DocumentHistory) => {
  const completedStages = doc.completedStages || [];
  const isDummy = doc.id.startsWith("dummy-");

  if (isDummy) return 0;

  let completedSteps = 0;

  // Check for explicit completion flags
  const hasSummary = completedStages.includes("summary");
  const hasQuiz = completedStages.includes("quiz");
  const hasPodcast = completedStages.includes("podcast");
  const hasChat = completedStages.includes("chat");

  if (hasSummary) completedSteps += 1;
  if (hasQuiz) completedSteps += 1;
  if (hasPodcast) completedSteps += 1;
  if (hasChat) completedSteps += 1;

  return (Math.min(completedSteps, 4) / 4) * 100;
};

const getSubProgress = (doc: DocumentHistory) => {
  const completedStages = doc.completedStages || [];
  if (doc.id.startsWith("dummy-")) return undefined;

  let completedSteps = 0;
  if (completedStages.includes("summary")) completedSteps += 1;
  if (completedStages.includes("quiz")) completedSteps += 1;
  if (completedStages.includes("podcast")) completedSteps += 1;
  if (completedStages.includes("chat")) completedSteps += 1;

  return `${completedSteps}/4`;
};

export default function DashboardOverviewPage() {
  const [history, setHistory] = useState<DocumentHistory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    user,
    userStats = { streak: 1, totalXP: 0, gems: 500, completedMissions: [] },
  } = useAuth();
  const [mascotQuote, setMascotQuote] = useState("Halo!");
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);
  const [showClaimReward, setShowClaimReward] = useState<{show: boolean, amount: number}>({ show: false, amount: 0 });
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [userMascot, setUserMascot] = useState<string | null>(null);
  const router = useRouter();

  // Load selected mascot from onboarding
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMascot = localStorage.getItem("selectedMascot");
      setUserMascot(savedMascot || "tiger"); // Default to tiger if not found
    }
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard?t=" + Date.now());
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard.slice(0, 5));
        }
      } catch (e) {
        console.error("Leaderboard fetch error:", e);
      }
    }
    fetchLeaderboard();
  }, []);

  const renderedNodes = useMemo(() => {
    // Pad history to ensure exactly 75 nodes (5 units * 15 quests)
    const paddedHistory = [...history];
    while (paddedHistory.length < 75) {
      paddedHistory.unshift({
        id: `dummy-${paddedHistory.length}`,
        fileName: `Misi Misteri ${paddedHistory.length + 1}`,
        createdAt: new Date().toISOString(),
      });
    }
    return paddedHistory.reverse();
  }, [history]);

  // Pre-calculate the current active mission index
  const firstUnfinishedIdx = useMemo(() => {
    for (let i = 0; i < renderedNodes.length; i++) {
      if (
        renderedNodes[i].id.startsWith("dummy-") ||
        calculateProgress(renderedNodes[i]) < 100
      ) {
        return i;
      }
    }
    return -1;
  }, [renderedNodes]);

  const mascotAssets: Record<string, { image: string, video?: string, name: string }> = {
    tiger: { 
      image: "/pet/tiger/image.png", 
      name: "Tiger Ninja" 
    },
    komodo: { 
      image: "/pet/komodo/image.png", 
      name: "Komodo Sage" 
    },
    rhino: { 
      image: "/pet/rhino/image.png", 
      name: "Rhino Tank" 
    }
  };

  const currentMascot = userMascot ? mascotAssets[userMascot] : mascotAssets.yeti;

  const triggerMotivation = () => {
    const name = user?.displayName
      ? user.displayName.split(" ")[0]
      : "Sobat Evoca";
    const quotes = [
      `Semangat belajarnya, ${name}!`,
      "Kamu pasti bisa!",
      `Teruslah belajar, ${name}!`,
      "Jangan menyerah!",
      `Kamu hebat, ${name}!`,
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setMascotQuote(randomQuote);
  };

  useEffect(() => {
    // 1. Initial Load from LocalStorage Cache (Immediate UI)
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("evoca_roadmap_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistory(parsed);
          }
        } catch (e) {
          console.error("Roadmap cache error:", e);
        }
      }
    }

    async function fetchDashboard() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch History with cache-busting timestamp
        const histRes = await fetch(
          `/api/history?userId=${user.uid}&t=${Date.now()}`,
        );
        const histData = await histRes.json();
        if (histData.success && histData.history) {
          setHistory(histData.history);
          localStorage.setItem(
            "evoca_roadmap_cache",
            JSON.stringify(histData.history),
          );
        }
      } finally {
        setLoading(false);
        // Trigger animations immediately after content is loaded
        setIsReadyToAnimate(true);
      }
    }

    fetchDashboard();
  }, [user?.uid]);

  // Handle Auto-Scroll to Current Node
  useEffect(() => {
    if (isReadyToAnimate && !loading) {
      setTimeout(() => {
        const currentNode = document.querySelector('[data-status="current"]');
        if (currentNode) {
          currentNode.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 1200); // Wait for initial animations to settle
    }
  }, [isReadyToAnimate, loading]);


  const todayStr = getTodayStr();

  // Check if any REAL quest (other than login) is completed today
  // Used to determine if the streak "fire" should be active/orange or inactive/grayscale
  const isQuestCompletedToday = useMemo(() => {
    const d = userStats?.dailyProgress?.[todayStr] || {};

    // Goals from mission templates: m1: 1, m2: 5, m4: 1, m3: 1
    const m1Completed = (d.documentsUploaded || 0) >= 1;
    const m2Completed = (d.messagesSent || 0) >= 5;
    const m3Completed = (d.quizzesPerfect || 0) >= 1;
    const m4Completed = (d.podcastsFinished || 0) >= 1;

    return m1Completed || m2Completed || m3Completed || m4Completed;
  }, [userStats, todayStr]);

  // Current Unfinished Daily Mission Logic (for the mini mission card)
  const currentDailyMission = useMemo(() => {
    const todayStr = getTodayStr();
    const d = userStats?.dailyProgress?.[todayStr] || {};

    const templates = [
      {
        id: "daily-visit",
        title: "Absensi Petualang",
        icon: "🔥",
        goal: 1,
        current: 1,
      },
      {
        id: "m1",
        title: "Pustakawan Cilik",
        icon: "📚",
        goal: 1,
        current: d.documentsUploaded || 0,
      },
      {
        id: "m2",
        title: "Si Paling Nanya",
        icon: "💬",
        goal: 5,
        current: d.messagesSent || 0,
      },
      {
        id: "m4",
        title: "Pendengar Setia",
        icon: "⚡",
        goal: 1,
        current: d.podcastsFinished || 0,
      },
      {
        id: "m3",
        title: "Pejuang Kuis",
        icon: "🏆",
        goal: 1,
        current: d.quizzesPerfect || 0,
      },
    ];

    const missions = templates.map((m) => ({
      ...m,
      completed: m.current >= m.goal,
      claimed:
        userStats?.completedMissions?.includes(`claim-${todayStr}-${m.id}`) ??
        false,
    }));



    return (
      missions.find((m) => !m.completed) || missions.find((m) => !m.claimed)
    );
  }, [userStats, todayStr]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes evoca-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        .hover-wave:hover {
          animation: evoca-wave 1s ease-in-out infinite;
          transform-origin: bottom center;
        }
        :root {
          --path-scale: 1;
        }
        @media (max-width: 768px) {
          :root {
            --path-scale: 0.85;
          }
        }
      `,
        }}
      />
      <div className="bg-white min-h-screen pb-32 font-sans">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200 px-4 md:px-8 py-4">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between md:justify-end">
            <div className="flex items-center gap-3 md:hidden">
              <div className="w-10 h-10 relative group-hover:rotate-6 transition-transform">
                <img
                  src="/favicon.ico"
                  alt="Evoca Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              {/* Duolingo Stats Icons */}
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/missions"
                  className={cn(
                    "flex items-center gap-2 group cursor-pointer transition-all duration-500",
                    !isQuestCompletedToday && "grayscale contrast-125 opacity-70"
                  )}
                  title={isQuestCompletedToday ? "Streak Aktif!" : "Selesaikan misi untuk menyalakan api!"}
                >
                  <span className={cn("text-xl transition-transform", isQuestCompletedToday && "animate-pulse scale-110")}>🔥</span>
                  <span className={cn(
                    "text-sm font-black transition-colors",
                    isQuestCompletedToday ? "text-[#ff9600]" : "text-stone-400"
                  )}>
                    {userStats.streak || 1}
                  </span>
                </Link>
                <Link
                  href="/dashboard/leaderboard"
                  className="flex items-center gap-2 group cursor-pointer"
                  title="Total XP"
                >
                  <span className="text-xl">⭐</span>
                  <span className="text-sm font-black text-[#8b5cf6] group-hover:scale-110 transition-transform">
                    <CountingNumber value={userStats.totalXP || 0} />
                  </span>
                </Link>
                <Link
                  href="/dashboard/missions"
                  className="flex items-center gap-2 group cursor-pointer"
                  title="Permata"
                >
                  <span className="text-xl">💎</span>
                  <span className="text-sm font-black text-[#1cb0f6] group-hover:scale-110 transition-transform">
                    <CountingNumber value={userStats.gems || 500} />
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-md border-b-4 border-amber-300">
                  <Sparkles className="w-5 h-5" />
                </button>
                <div className="relative group">
                  <button className="w-10 h-10 bg-white border border-stone-200 rounded-2xl flex items-center justify-center shadow-sm hover:bg-stone-50 transition-colors">
                    <Bell className="w-5 h-5 text-stone-400" />
                  </button>
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 max-w-[1240px] mx-auto mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
         {/* Main Learning Path Area */}
         <div className="relative flex flex-col items-center">
          <div className="relative w-full max-w-md flex flex-col items-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh] w-full">
                <div className="w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest text-center">
                  Membangun Jalur Belajarmu...
                </p>
              </div>
            ) : selectedUnitId === null ? (
              /* Unit Selection Hub */
              <div className="w-full space-y-8 py-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-black text-stone-900 uppercase tracking-tight mb-2">Pilih Petualanganmu</h2>
                  <p className="text-stone-500 font-bold uppercase text-[10px] tracking-[0.2em]">Selesaikan setiap unit untuk membuka tantangan baru!</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {UNITS.map((unit, uIdx) => {
                    const isUnlocked = uIdx === 0 || (firstUnfinishedIdx >= uIdx * 15);
                    const isCompleted = firstUnfinishedIdx > (uIdx + 1) * 15 - 1 && firstUnfinishedIdx !== -1;
                    
                    return (
                      <motion.div
                        key={unit.id}
                        whileHover={isUnlocked ? { y: -5, scale: 1.02 } : {}}
                        whileTap={isUnlocked ? { scale: 0.98 } : {}}
                        onClick={() => isUnlocked && setSelectedUnitId(unit.id)}
                        className={cn(
                          "relative overflow-hidden rounded-[2.5rem] p-8 border-4 transition-all cursor-pointer group",
                          isUnlocked 
                            ? "bg-white border-stone-200 shadow-xl hover:border-indigo-500 shadow-stone-200/50" 
                            : "bg-stone-50 border-stone-100 opacity-60 grayscale cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-10 -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-110 bg-linear-to-br",
                          unit.bgGradient
                        )} />
                        
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                          {/* Monster Preview */}
                          <div className="w-32 h-32 flex-shrink-0 relative">
                             {unit.monsters[0]?.video ? (
                               <video src={unit.monsters[0].video} autoPlay loop muted playsInline className="w-full h-full object-contain mix-blend-multiply" />
                             ) : (
                               <img src={unit.monsters[0]?.image} alt={unit.monsters[0]?.name} className="w-full h-full object-contain mix-blend-multiply opacity-50" />
                             )}
                             {!isUnlocked && (
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-stone-900/60 backdrop-blur-md p-3 rounded-full text-white">
                                    <Zap className="w-6 h-6 fill-amber-400 text-amber-400" />
                                  </div>
                               </div>
                             )}
                          </div>

                          <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                              <span className={cn(
                                "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white w-fit mx-auto md:mx-0 bg-linear-to-r",
                                unit.bgGradient
                              )}>
                                UNIT {unit.id}
                              </span>
                              {isCompleted && (
                                <span className="flex items-center gap-1 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                  <Trophy className="w-3 h-3" /> SELESAI
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight mb-2">{unit.title}</h3>
                            <p className="text-stone-500 font-medium text-xs leading-relaxed mb-6 max-w-sm line-clamp-2">{unit.description}</p>
                            
                            <div className="flex items-center justify-center md:justify-start gap-4">
                              <button className={cn(
                                "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-b-4",
                                isUnlocked 
                                  ? "bg-white text-stone-900 border-stone-200 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-700" 
                                  : "bg-stone-100 text-stone-400 border-stone-200"
                              )}>
                                {isUnlocked ? (isCompleted ? "ULANGI UNIT" : "LANJUTKAN") : "TERKUNCI"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Quest Path View */
              <div className="flex flex-col items-center w-full space-y-12 relative py-12">
                 {/* Back to Hub Button */}
                 <div className="sticky top-0 w-full z-50 flex justify-start pointer-events-none pb-4">
                   <button 
                     onClick={() => setSelectedUnitId(null)}
                     className="pointer-events-auto flex items-center gap-2 px-6 py-2 bg-white border-2 border-stone-200 rounded-full text-stone-500 font-black text-[10px] uppercase tracking-widest hover:bg-stone-50 hover:border-stone-400 hover:text-stone-900 transition-all shadow-md mt-4"
                   >
                      <ChevronLeft className="w-4 h-4" /> Kembali
                   </button>
                 </div>

                 <div className="text-center">
                    {(() => {
                      const activeUnit = UNITS.find(u => u.id === selectedUnitId)!;
                      return (
                        <>
                          <span className={cn(
                            "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-linear-to-r",
                            activeUnit.bgGradient
                          )}>
                            Unit {selectedUnitId}
                          </span>
                          <h2 className="text-3xl font-black text-stone-900 uppercase mt-2 tracking-tight">{activeUnit.title}</h2>
                        </>
                      );
                    })()}
                 </div>

                {/* Path Units Path */}
                <div className="flex flex-col items-center w-full space-y-0 relative z-10">
                  {(() => {
                    const activeUnit = UNITS.find(u => u.id === selectedUnitId)!;
                    const unitIdx = selectedUnitId - 1;
                    const unitNodes = renderedNodes.slice(unitIdx * 15, (unitIdx + 1) * 15);

                    const getStatus = (globalIdx: number, firstUnfinishedIdx: number) => {
                      if (globalIdx < firstUnfinishedIdx && firstUnfinishedIdx !== -1) {
                        return "completed";
                      } else if (globalIdx === firstUnfinishedIdx) {
                        return "current";
                      } else {
                        return "locked";
                      }
                    };

                    return unitNodes.map((doc, idx) => {
                      const globalIdx = unitIdx * 15 + idx;
                      const isDummy = doc.id.startsWith("dummy-");
                      const isRewardNode = (idx + 1) % 5 === 0;
                      const status = getStatus(globalIdx, firstUnfinishedIdx);
                      const isUnlocked = status !== "locked";

                      // Mascot positions: middle of each 5-node sub-group (idx 2, 7, 12)
                      // Stage 0 (Young) at Top (idx 0-4), Stage 2 (Adult) at Bottom (idx 10-14)
                      const mascotIdx = Math.floor(idx / 5);
                      const isMascotNode = idx % 5 === 2;

                      // Unified Animation progress logic
                      const rawProgress = calculateProgress(doc);
                      const progress = isUnlocked ? rawProgress : 0;

                      const handleClaimReward = async () => {
                        if (status === "locked" || status === "completed") return;

                        try {
                          const res = await fetch("/api/progress?t=" + Date.now(), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              documentId: doc.id,
                              stage: "reward",
                              userId: user?.uid,
                              gemsGained: 50,
                              xpGained: 50
                            }),
                          });

                          if (res.ok) {
                            setShowClaimReward({ show: true, amount: 50 });
                            setTimeout(() => {
                              setShowClaimReward({ show: false, amount: 0 });
                              router.refresh();
                            }, 3000);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      };

                      // Original Zig-Zag Curve Logic (Flipping every 5 nodes)
                      const subUnitIndex = Math.floor(idx / 5);
                      const positionInSubUnit = idx % 5;
                      const isSubUnitEven = subUnitIndex % 2 === 0;
                      const baseOffsets = [0, 60, 95, 60, 0];
                      const xOffset = isSubUnitEven
                        ? baseOffsets[positionInSubUnit]
                        : -baseOffsets[positionInSubUnit];

                      return (
                        <div
                          key={doc.id}
                          data-status={status}
                          className={cn(
                            "relative w-full flex flex-col items-center py-2"
                          )}
                        >
                          {/* Mascot - Rendered for every 5 nodes in the unit path */}
                          {isMascotNode && (
                            <div
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 z-0",
                                isSubUnitEven ? "right-1/2 mr-16 md:mr-24" : "left-1/2 ml-16 md:ml-24"
                              )}
                            >
                              <div
                                className="relative w-28 h-28 md:w-32 md:h-32 group pointer-events-auto cursor-pointer"
                                onMouseEnter={triggerMotivation}
                              >
                                {activeUnit.monsters[mascotIdx]?.video ? (
                                  <video
                                    src={activeUnit.monsters[mascotIdx].video}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain pointer-events-none mix-blend-multiply hover-wave"
                                  />
                                ) : (
                                  <img
                                    src={activeUnit.monsters[mascotIdx]?.image}
                                    alt={`Mascot ${activeUnit.monsters[mascotIdx]?.name}`}
                                    className="w-full h-full object-contain pointer-events-none mix-blend-multiply"
                                  />
                                )}

                                <div className="absolute -top-6 left-1/2 w-max max-w-[150px] md:max-w-[200px] -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-stone-100 shadow-xl ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 ease-out -translate-y-2 group-hover:-translate-y-4 scale-90 group-hover:scale-100 origin-bottom z-50">
                                  <p className="text-[10px] font-black text-stone-700 text-center leading-relaxed">
                                    {mascotQuote}
                                  </p>
                                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-stone-100 rotate-45" />
                                </div>
                              </div>
                            </div>
                          )}

                          <div
                            className="relative z-10"
                            style={{
                              transform: `translateX(calc(var(--path-scale, 1) * ${xOffset}px))`,
                              transition:
                                "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                          >
                            <PathNode
                              type={isDummy ? "new" : "document"}
                              progress={isRewardNode ? (status === "completed" ? 100 : 0) : progress}
                              subProgress={isRewardNode ? (status === "completed" ? "DIKLAIM" : "BARU") : getSubProgress(doc)}
                              title={isRewardNode ? "Harta Karun" : (doc.metadata?.title || doc.fileName)}
                              icon={isDummy ? Gift : (isRewardNode ? Gift : BookOpen)}
                              status={status}
                              href={
                                isUnlocked && !isRewardNode
                                  ? (isDummy ? "/dashboard/new" : `/ai-reader/${doc.id}?theme=${activeUnit.theme}&materi=${globalIdx + 1}`)
                                  : undefined
                              }
                              onClick={isRewardNode ? handleClaimReward : undefined}
                              specialType={isRewardNode ? "chest" : (isDummy ? "chest" : undefined)}
                              isTooltipVisible={status === "current"}
                              theme={activeUnit.theme}
                              pdfUrl={doc.fileUrl}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:flex flex-col gap-6 ">
            {/* Streak Card - Video Mascot Edition */}
            <div className="bg-white border-2 border-stone-200 rounded-[2rem] p-6 text-center">
              {/* Mascot Video */}
              <div className={cn(
                "w-48 h-48 mx-auto relative mb-4 transition-all duration-700 ease-in-out",
                !isQuestCompletedToday ? "grayscale opacity-40 scale-90" : "scale-100"
              )}>
                {currentMascot?.video ? (
                  <video
                    src={currentMascot.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={cn(
                      "w-full h-full object-contain mix-blend-multiply hover-wave",
                      isQuestCompletedToday && "animate-fire-active"
                    )}
                  />
                ) : (
                  <img
                    src={currentMascot?.image}
                    alt={currentMascot?.name}
                    className={cn(
                      "w-full h-full object-contain mix-blend-multiply hover-wave",
                      isQuestCompletedToday && "animate-fire-active"
                    )}
                  />
                )}
                {/* Visual indicator that it's "off" */}
                {!isQuestCompletedToday && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Flame className="w-6 h-6 text-stone-400" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 mb-6">
                <h3 className={cn(
                  "text-xl font-black uppercase tracking-tight leading-none transition-colors duration-500",
                  isQuestCompletedToday ? "text-stone-900" : "text-stone-400"
                )}>
                  {currentMascot?.name}
                </h3>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                  isQuestCompletedToday ? "text-orange-500" : "text-stone-300"
                )}>
                  Streak {userStats.streak || 1} Hari
                </p>

                {/* Temporary Test Button as requested */}
                <button
                  onClick={async () => {
                    console.log("[DEBUG] Cheat button clicked. UID:", user?.uid);
                    if (user?.uid) {
                      try {
                        const nameParam = user.displayName ? `&displayName=${encodeURIComponent(user.displayName)}` : "";
                        const photoParam = user.photoURL ? `&photoURL=${encodeURIComponent(user.photoURL)}` : "";
                        const res = await fetch(`/api/test-xp?userId=${user.uid}&amount=500${nameParam}${photoParam}`);
                        const data = await res.json();
                        console.log("[DEBUG] API Response:", data);
                        if (data.success) {
                           alert(data.message);
                           window.location.reload();
                        } else {
                           alert("Gagal: " + data.error);
                        }
                      } catch (err) {
                        console.error("[DEBUG] Fetch error:", err);
                        alert("Terjadi kesalahan koneksi.");
                      }
                    } else {
                      alert("Error: User UID tidak ditemukan. Pastikan Anda sudah login.");
                      console.log("[DEBUG] User object in AuthContext:", user);
                    }
                  }}
                  className="mt-2 text-[8px] bg-rose-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-sm"
                >
                  Cheat: +500 XP
                </button>
              </div>

              <div className="flex justify-between items-center gap-1.5 px-2">
                {["S", "S", "R", "K", "J", "S", "M"].map((day, i) => {
                  const now = new Date();
                  const today = now.getDay(); // 0 (Sun) to 6 (Sat)
                  const dayOfWeek = today === 0 ? 6 : today - 1; // 0 (Mon) to 6 (Sun)
                  const isToday = i === dayOfWeek;

                  // Calculate date for this day in the current week (starting Monday)
                  const currentDayDate = new Date();
                  const diff = i - dayOfWeek;
                  currentDayDate.setDate(now.getDate() + diff);

                  const dateStr = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Jakarta",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(currentDayDate);

                  // Check if there was activity on this day
                  const d = userStats?.dailyProgress?.[dateStr] || {};
                  const hasActivity = (d.documentsUploaded || 0) >= 1 || (d.messagesSent || 0) >= 5 || (d.quizzesPerfect || 0) >= 1 || (d.podcastsFinished || 0) >= 1;

                  const isCompleted = isToday ? isQuestCompletedToday : hasActivity;

                  return (
                    <div
                      key={day + i}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <div
                        className={cn(
                          "w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                          isCompleted
                            ? "bg-orange-500 text-white shadow-[0_4px_0_0_#ea580c] -translate-y-1"
                            : (isToday
                              ? "bg-white border-2 border-orange-500 text-orange-500"
                              : "bg-stone-100 text-stone-400 border-b-4 border-stone-200"
                            ),
                        )}
                      >
                        {isToday && isQuestCompletedToday ? "🔥" : day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo Card */}
            <div className="bg-[#8b5cf6] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-[0_8px_0_0_#7c3aed] group hover:translate-y-1 hover:shadow-[0_4px_0_0_#7c3aed] transition-all">
              <div className="relative z-10">
                <h3 className="text-xl font-black leading-tight uppercase tracking-tight italic">
                  Coba Evoca
                  <br />
                  Gratis!
                </h3>
                <p className="text-[10px] mt-2 font-bold opacity-80 uppercase tracking-widest leading-relaxed">
                  Tanpa iklan, tantangan tak terbatas, dan fitur pro!
                </p>
                <button className="mt-6 w-full py-3 bg-white text-[#8b5cf6] rounded-2xl font-black text-xs uppercase shadow-[0_4px_0_0_#e2e8f0]">
                  COBA GRATIS
                </button>
              </div>
              {/* Floating Mascot in Background */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 pointer-events-none group-hover:scale-125 transition-transform duration-500">
                <Sparkles className="w-full h-full text-white" />
              </div>
              <div className="absolute right-4 top-4 text-4xl">🦉</div>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-white border-2 border-stone-200 rounded-[2rem] p-6 shadow-sm hover:translate-y-1 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                  Papan Skor
                </h3>
                <Link
                  href="/dashboard/leaderboard"
                  className="text-[10px] font-black text-[#8b5cf6] uppercase"
                >
                  LIHAT SEMUA
                </Link>
              </div>

              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  leaderboard.map((u, i) => (
                    <div key={u.uid} className="flex items-center gap-3 group/user">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] transition-transform group-hover/user:scale-110",
                        i === 0 ? "bg-amber-400 text-white shadow-[0_2px_0_0_#d97706]" : 
                        i === 1 ? "bg-stone-300 text-white shadow-[0_2px_0_0_#78716c]" : 
                        i === 2 ? "bg-orange-400 text-white shadow-[0_2px_0_0_#c2410c]" : "bg-stone-100 text-stone-400"
                      )}>
                        {i + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border-2 border-white shadow-sm ring-1 ring-stone-100">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm uppercase">{u.avatar}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-stone-900 truncate uppercase tracking-tight">{u.name}</p>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                          <CountingNumber value={u.score} /> XP
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-8 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Memuat Papan Skor...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Misi Card - Vibrant Yellow/Gold Container */}
            <div className="bg-linear-to-br from-[#ffc800] to-[#ff9600] border-2 border-white/20 rounded-[2rem] p-6 shadow-xl shadow-amber-500/20 hover:translate-y-1 transition-all overflow-hidden relative group">
              {/* Background Decoration */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-sm font-black text-amber-950 uppercase tracking-widest drop-shadow-sm">
                  Misi Harian
                </h3>
                <Link href="/dashboard/missions" className="text-[10px] font-black text-amber-900/80 hover:text-amber-950 uppercase tracking-wider transition-colors">
                  LIHAT SEMUA
                </Link>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="p-4 bg-white/30 backdrop-blur-md border border-white/40 rounded-3xl shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-lg">
                        {currentDailyMission ? currentDailyMission.icon : "🎉"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-amber-900/60 uppercase tracking-widest truncate">
                        {currentDailyMission ? "Misi Berikutnya" : "Luar Biasa!"}
                      </p>
                      <p className="text-xs font-black text-amber-950 truncate">
                        {currentDailyMission
                          ? currentDailyMission.title
                          : "Semua Misi Selesai!"
                        }
                      </p>
                    </div>
                  </div>

                  {currentDailyMission && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[9px] font-bold text-amber-900/70 uppercase tracking-widest">
                        <span>Progress</span>
                        <span>
                          {currentDailyMission.current}/
                          {currentDailyMission.goal}
                        </span>
                      </div>
                      <div className="h-2 bg-black/5 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                          style={{ width: `${Math.min((currentDailyMission.current / currentDailyMission.goal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link href="/dashboard/missions" className="mt-4 w-full py-3 bg-white text-amber-500 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center border-b-4 border-amber-100">
                    {currentDailyMission ? "CEK MISI SEKARANG" : "KLAIM HADIAHMU"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer Links (Duolingo Style) */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 mt-4">
              {["Tentang", "Sekolah", "Aplikasi", "Bantuan", "Kebijakan"].map(
                (link) => (
                  <Link
                    key={link}
                    href="#"
                    className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-600 transition-colors"
                  >
                    {link}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Celebration Overlay */}
      <AnimatePresence>
        {showClaimReward.show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-indigo-500 text-center relative overflow-hidden">
               <div className="relative z-10">
                  <div className="text-6xl mb-4">💎</div>
                  <h2 className="text-3xl font-black text-indigo-600 uppercase mb-2">Hebat!</h2>
                  <p className="text-stone-500 font-bold uppercase text-xs tracking-widest">+ {showClaimReward.amount} Permata Berhasil Diklaim</p>
               </div>
               
               {/* Confetti-like bits with Framer Motion */}
               {[...Array(6)].map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ y: 0, x: 0, opacity: 1 }}
                   animate={{ 
                     y: [0, -100, -200], 
                     x: [0, (i % 2 === 0 ? 50 : -50), (i % 2 === 0 ? 100 : -100)],
                     opacity: 0 
                   }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute top-1/2 left-1/2 text-xl"
                 >
                   ✨
                 </motion.div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
