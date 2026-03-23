"use client";

import { useState, useEffect, useMemo } from "react";
import { cn, getTodayStr } from "@/src/lib/utils";
import { PathNode, THEMES } from "@/src/components/reader/PathNode";
import {
  Bell,
  Sparkles,
  Search,
  Plus,
  BookOpen,
  Trophy,
  Flame,
  MessageCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { CountingNumber } from "@/src/components/ui/CountingNumber";

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
  const [loading, setLoading] = useState(true);
  const {
    user,
    userStats = { streak: 1, totalXP: 0, gems: 500, completedMissions: [] },
  } = useAuth();
  const [mascotQuote, setMascotQuote] = useState("Halo!");
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);

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

  const renderedNodes = useMemo(() => {
    // Pad history to ensure exactly 20 nodes
    const paddedHistory = [...history];
    while (paddedHistory.length < 20) {
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

  // Current Unfinished Daily Mission Logic
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

    // Find the first one that is NOT claimed (since even if completed, it might not be claimed)
    // Actually the user said "misi yang belum selesai", which normally means not completed.
    // If it's completed but not claimed, we can still show it or show the next one.
    // Let's show the first mission that is NOT completed.
    // If all are completed, but some are not claimed, we could show those.
    // But the most common meaning of "belum selesai" is not reached the goal.

    return (
      missions.find((m) => !m.completed) || missions.find((m) => !m.claimed)
    );
  }, [userStats, getTodayStr()]);

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
                  className="flex items-center gap-2 group cursor-pointer"
                  title="Streak"
                >
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-black text-[#ff9600] group-hover:scale-110 transition-transform">
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
                <div className="flex flex-col items-center gap-6 py-24">
                  <div className="w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">
                    Membangun Jalur Belajarmu...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full space-y-16 relative py-12">
                  {/* Path Units */}
                  <div className="flex flex-col items-center w-full space-y-0 relative z-10">
                    {(() => {
                      // Master Array for Mascots Configuration
                      const mascots = [
                        {
                          name: "Yeti",
                          video: "/pet/yeti/mascot-yeti.mp4",
                          image: "/pet/yeti/yeti-base.jpeg",
                          theme: "evoca1",
                        },
                        {
                          name: "Stellar",
                          video: "/pet/yeti/mascot-yeti.mp4",
                          image: "/pet/yeti/yeti-second.jpeg",
                          theme: "evoca2",
                        },
                        {
                          name: "Astral",
                          video: "/pet/yeti/mascot-yeti.mp4",
                          image:
                            "/pet/yeti/Yeti_remaja_bertambah_besar_lucu_a35b3b97c9.jpeg",
                          theme: "evoca3",
                        },
                        {
                          name: "Nova",
                          video: "/pet/yeti/mascot-yeti.mp4",
                          image: "/pet/yeti/yeti-base.jpeg",
                          theme: "evoca4",
                        },
                      ] as const;

                      return renderedNodes.map((doc, idx) => {
                        const isDummy = doc.id.startsWith("dummy-");
                        const rawProgress = calculateProgress(doc);

                        let status: "locked" | "current" | "completed";

                        if (
                          idx < firstUnfinishedIdx &&
                          firstUnfinishedIdx !== -1
                        ) {
                          status = "completed";
                        } else if (idx === firstUnfinishedIdx) {
                          status = "current";
                        } else {
                          status = "locked";
                        }

                        const isUnlocked = status !== "locked";
                        const isCurrentActiveNode = status === "current";

                        // Unified Animation progress logic
                        let progress = 0;
                        if (isReadyToAnimate) {
                          progress = isUnlocked ? rawProgress : 0;
                        } else {
                          progress = 0;
                        }

                        // Units of 5
                        const unitIndex = Math.floor(idx / 5);
                        const positionInUnit = idx % 5;
                        const isMonsterNode = positionInUnit === 4;

                        // Configuration for this mascot block
                        const safeUnitIdx = Math.min(
                          unitIndex,
                          mascots.length - 1,
                        );
                        const blockMascot = mascots[safeUnitIdx];
                        const theme = blockMascot.theme as
                          | "evoca1"
                          | "evoca2"
                          | "evoca3"
                          | "evoca4"
                          | "evoca5";

                        // Mascot for a unit is colored if the user has reached any mission in that unit
                        const isBlockUnlocked =
                          unitIndex === 0 ||
                          firstUnfinishedIdx === -1 ||
                          firstUnfinishedIdx >= unitIndex * 5;

                        const isFirstInUnit = positionInUnit === 0 && idx !== 0;

                        // Stronger Curved Offset Logic
                        const isUnitEven = unitIndex % 2 === 0;
                        const baseOffsets = [0, 60, 95, 60, 0];
                        const xOffset = isUnitEven
                          ? baseOffsets[positionInUnit]
                          : -baseOffsets[positionInUnit];

                        return (
                          <div
                            key={doc.id}
                            data-status={status}
                            className={cn(
                              "relative w-full flex flex-col items-center py-2",
                              isFirstInUnit && "mt-12",
                            )}
                          >
                            {/* Mascot - Placed only once per 5 quests (centered vertically across the 5 quests, which is position 2) */}
                            {positionInUnit === 2 && (
                              <div
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 z-0",
                                  // Place mascot significantly far to the left or right, at the peak of the curve's height
                                  isUnitEven
                                    ? "right-1/2 mr-14 md:mr-20"
                                    : "left-1/2 ml-14 md:ml-20",
                                )}
                              >
                                <div
                                  className="relative w-32 h-32 md:w-36 md:h-36 group pointer-events-auto cursor-pointer"
                                  onMouseEnter={triggerMotivation}
                                >
                                  {/* Conditionally Render Video vs Grayscale Image */}
                                  {isBlockUnlocked ? (
                                    <video
                                      src={blockMascot.video}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className="w-full h-full object-contain pointer-events-none mix-blend-multiply hover-wave"
                                    />
                                  ) : (
                                    <img
                                      src={blockMascot.image}
                                      alt={`Locked Mascot ${blockMascot.name}`}
                                      className="w-full h-full object-contain pointer-events-none mix-blend-multiply grayscale opacity-60"
                                    />
                                  )}

                                  {/* Speech Bubble Component (Only for Unlocked Mascots) */}
                                  {isBlockUnlocked && (
                                    <div className="absolute -top-6 left-1/2 w-max max-w-[200px] md:max-w-[250px] -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-3 rounded-3xl border border-stone-100 shadow-2xl ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 ease-out -translate-y-2 group-hover:-translate-y-6 scale-90 group-hover:scale-100 origin-bottom z-50">
                                      <p className="text-[11px] md:text-xs font-black text-stone-700 text-center leading-relaxed">
                                        {mascotQuote}
                                      </p>
                                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-stone-100 rotate-45" />
                                    </div>
                                  )}
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
                                progress={progress}
                                subProgress={getSubProgress(doc)}
                                title={doc.metadata?.title || doc.fileName}
                                icon={isDummy ? Plus : BookOpen}
                                status={status}
                                href={
                                  isUnlocked
                                    ? isDummy
                                      ? "/dashboard/new"
                                      : `/ai-reader/${doc.id}?theme=${theme}`
                                    : "#"
                                }
                                specialType={
                                  isDummy
                                    ? isMonsterNode
                                      ? "monster"
                                      : "chest"
                                    : undefined
                                }
                                isTooltipVisible={status === "current"}
                                theme={theme}
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
              <div className="w-48 h-48 mx-auto relative mb-4">
                <video
                  src="/pet/yeti/mascot-yeti.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain mix-blend-multiply hover-wave"
                />
              </div>

              <div className="flex flex-col items-center gap-2 mb-6">
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight leading-none">
                  Streak {userStats.streak || 1} Hari
                </h3>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  {userStats.streak > 1 ? "Pertahankan!" : "Luar biasa!"} 🔥
                </p>
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
                  const hasActivity = !!userStats.dailyProgress?.[dateStr];
                  const isHighlighted = hasActivity || isToday;

                  return (
                    <div
                      key={day + i}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <div
                        className={cn(
                          "w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                          isHighlighted
                            ? "bg-orange-500 text-white shadow-[0_4px_0_0_#ea580c] -translate-y-1"
                            : "bg-stone-100 text-stone-400 border-b-4 border-stone-200",
                        )}
                      >
                        {isToday ? "🔥" : hasActivity ? "✅" : day}
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

              <div className="flex flex-col items-center py-8 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center text-stone-400 mb-4 shadow-inner">
                  <Trophy className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-tight px-6 leading-relaxed">
                  Ikuti kompetisi mingguan dan raih hadiah menakjubkan!
                </p>
              </div>
            </div>

            {/* Daily Misi Card */}
            <div className="bg-white border-2 border-stone-200 rounded-[2rem] p-6 shadow-sm hover:translate-y-1 transition-all overflow-hidden relative group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                  Misi Harian
                </h3>
                <Link
                  href="/dashboard/missions"
                  className="text-[10px] font-black text-[#58cc02] uppercase"
                >
                  LIHAT SEMUA
                </Link>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-lg">
                        {currentDailyMission ? currentDailyMission.icon : "🎉"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate">
                        {currentDailyMission
                          ? "Misi Berikutnya"
                          : "Luar Biasa!"}
                      </p>
                      <p className="text-xs font-black text-indigo-900 truncate">
                        {currentDailyMission
                          ? currentDailyMission.title
                          : "Semua Misi Selesai!"}
                      </p>
                    </div>
                  </div>

                  {currentDailyMission && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">
                        <span>Progress</span>
                        <span>
                          {currentDailyMission.current}/
                          {currentDailyMission.goal}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((currentDailyMission.current / currentDailyMission.goal) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <Link
                    href="/dashboard/missions"
                    className="mt-4 w-full py-3 bg-[#58cc02] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-[0_4px_0_0_#46a302] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center"
                  >
                    {currentDailyMission
                      ? "CEK MISI SEKARANG"
                      : "KLAIM HADIAHMU"}
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
    </>
  );
}
