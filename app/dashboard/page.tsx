"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { PathNode } from "@/src/components/reader/PathNode";
import { Bell, Sparkles, Search, Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

interface DocumentHistory {
  id: string;
  fileName: string;
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
}

export default function DashboardOverviewPage() {
  const [history, setHistory] = useState<DocumentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [mascotQuote, setMascotQuote] = useState("Halo!");

  const triggerMotivation = () => {
    const name = user?.displayName ? user.displayName.split(" ")[0] : "Sobat Evoca";
    const quotes = [
      `Semangat belajarnya, ${name}!`,
      "Kamu pasti bisa!",
      `Teruslah belajar, ${name}!`,
      "Jangan menyerah!",
      `Kamu hebat, ${name}!`
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setMascotQuote(randomQuote);
  };

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/history?userId=${user.uid}`);
        const data = await response.json();
        if (data.success && data.history) {
          setHistory(data.history);
        }
      } catch (error) {
        console.error("Error fetching study history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user?.uid]);

  const calculateProgress = (doc: DocumentHistory) => {
    let completedSteps = 0;
    if (doc.metadata?.summary) completedSteps += 1;
    if (doc.quizData) completedSteps += 1;
    if (doc.podcastScript) completedSteps += 1;
    if (doc.chatHistory && doc.chatHistory.length > 0) completedSteps += 1;
    return (completedSteps / 4) * 100;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
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
      `}} />
      <div className="bg-white min-h-screen pb-32 font-sans">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200 px-4 md:px-8 py-4">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  title="Streak"
                >
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-black text-[#ff9600] group-hover:scale-110 transition-transform">
                    1
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  title="Permata"
                >
                  <span className="text-xl">💎</span>
                  <span className="text-sm font-black text-[#1cb0f6] group-hover:scale-110 transition-transform">
                    505
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  title="Nyawa"
                >
                  <span className="text-xl text-red-500">❤️</span>
                  <span className="text-sm font-black text-[#ff4b4b] group-hover:scale-110 transition-transform">
                    5
                  </span>
                </div>
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
                  {history.length >= 0 && (
                    <div className="flex flex-col items-center w-full space-y-0 relative z-10">
                      {(() => {
                        // Pad history to ensure exactly 20 nodes
                        const paddedHistory = [...history];
                        while (paddedHistory.length < 20) {
                          paddedHistory.unshift({
                            id: `dummy-${paddedHistory.length}`,
                            fileName: `Misi Misteri ${paddedHistory.length + 1}`,
                            createdAt: new Date().toISOString()
                          });
                        }

                        const renderedNodes = paddedHistory.reverse();

                        // Master Array for Mascots Configuration
                        const mascots = [
                          { name: "Yeti", video: "/pet/yeti/mascot-yeti.mp4", image: "/pet/yeti/yeti-base.jpeg", theme: "evoca1" },
                          { name: "Stellar", video: "/pet/yeti/mascot-yeti.mp4", image: "/pet/yeti/yeti-second.jpeg", theme: "evoca2" },
                          { name: "Astral", video: "/pet/yeti/mascot-yeti.mp4", image: "/pet/yeti/Yeti_remaja_bertambah_besar_lucu_a35b3b97c9.jpeg", theme: "evoca3" },
                          { name: "Nova", video: "/pet/yeti/mascot-yeti.mp4", image: "/pet/yeti/yeti-base.jpeg", theme: "evoca4" }
                        ] as const;

                        // Flag variables to track progression and unlocking
                        let foundFirstIncomplete = false;

                        return renderedNodes.map((doc, idx) => {
                          const rawProgress = calculateProgress(doc);

                          // Determine real progression vs locked
                          const isUnlocked = !foundFirstIncomplete;
                          const isCurrentActiveNode = !foundFirstIncomplete && rawProgress < 100;
                          if (rawProgress < 100) {
                            foundFirstIncomplete = true;
                          }

                          // Reset progress to 0 visually if locked
                          const progress = isUnlocked ? rawProgress : 0;
                          const status = isUnlocked ? (progress === 100 ? "completed" : "current") : "locked";

                          // Units of 5
                          const unitIndex = Math.floor(idx / 5);
                          const positionInUnit = idx % 5;
                          const isMonsterNode = positionInUnit === 4;

                          // Ensure unitIndex doesn't exceed our 4 mascot themes unexpectedly
                          const safeUnitIndex = Math.min(unitIndex, mascots.length - 1);
                          const blockMascot = mascots[safeUnitIndex];
                          const theme = blockMascot.theme as "evoca1" | "evoca2" | "evoca3" | "evoca4" | "evoca5";

                          // Identify if the whole 5-quest block is unlocked.
                          // A block is unlocked if it's the first block (unitIndex === 0) 
                          // OR if the very last node of the PREVIOUS block was 100% completed.
                          let isBlockUnlocked = false;
                          if (unitIndex === 0) {
                            isBlockUnlocked = true;
                          } else {
                            const previousBlockLastNodeIdx = (unitIndex * 5) - 1;
                            if (renderedNodes[previousBlockLastNodeIdx]) {
                              isBlockUnlocked = calculateProgress(renderedNodes[previousBlockLastNodeIdx]) === 100;
                            }
                          }

                          const isFirstInUnit = positionInUnit === 0 && idx !== 0;

                          // Stronger Curved Offset Logic - Sine wave like pattern
                          const isUnitEven = unitIndex % 2 === 0;
                          const baseOffsets = [0, 60, 95, 60, 0];
                          const xOffset = isUnitEven
                            ? baseOffsets[positionInUnit]
                            : -baseOffsets[positionInUnit];

                          return (
                            <div
                              key={doc.id}
                              className={cn("relative w-full flex flex-col items-center py-2", isFirstInUnit && "mt-12")}
                            >
                              {/* Mascot - Placed only once per 5 quests (centered vertically across the 5 quests, which is position 2) */}
                              {positionInUnit === 2 && (
                                <div
                                  className={cn(
                                    "absolute top-1/2 -translate-y-1/2 z-0",
                                    // Place mascot significantly far to the left or right, at the peak of the curve's height
                                    isUnitEven ? "right-1/2 mr-20 md:mr-28" : "left-1/2 ml-20 md:ml-28"
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
                                  transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                              >
                                <PathNode
                                  type="document"
                                  progress={progress}
                                  title={doc.metadata?.title || doc.fileName}
                                  icon={BookOpen}
                                  status={status}
                                  href={
                                    isUnlocked
                                      ? (doc.id.startsWith("dummy-") ? "/dashboard/new" : `/ai-reader/${doc.id}?theme=${theme}`)
                                      : "#"
                                  }
                                  specialType={isMonsterNode ? "monster" : "chest"}
                                  isTooltipVisible={isCurrentActiveNode}
                                  theme={theme}
                                />
                              </div>
                            </div>
                          );
                        })
                      })()}
                    </div>
                  )}
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
                  Streak 1 Hari
                </h3>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Luar biasa! 🔥
                </p>
              </div>

              <div className="flex justify-between items-center gap-1.5 px-2">
                {["S", "S", "R", "K", "J", "S", "M"].map((day, i) => (
                  <div
                    key={day + i}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
                    <div
                      className={cn(
                        "w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                        i === 0
                          ? "bg-orange-500 text-white shadow-[0_4px_0_0_#ea580c] -translate-y-1"
                          : "bg-stone-100 text-stone-400 border-b-4 border-stone-200",
                      )}
                    >
                      {i === 0 ? "🔥" : day}
                    </div>
                  </div>
                ))}
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
              <div className="absolute right-4 top-4 text-4xl animate-bounce">
                🦉
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-white border-2 border-stone-200 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                  Papan Skor
                </h3>
                <Link
                  href="#"
                  className="text-[10px] font-black text-[#8b5cf6] uppercase"
                >
                  LIHAT SEMUA
                </Link>
              </div>

              <div className="flex flex-col items-center py-8 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center text-stone-400 mb-4 shadow-inner">
                  <Search className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-tight px-6 leading-relaxed">
                  Selesaikan 1 misi lagi untuk mulai berkompetisi!
                </p>
              </div>
            </div>

            {/* Daily Misi Card */}
            <div className="bg-white border-2 border-stone-200 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                  Misi Harian
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#f3f4f6] rounded-2xl border border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚡</span>
                      <span className="text-[10px] font-black text-stone-900 uppercase">
                        Dapatkan 10 XP
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-[#7c3aed]">
                      10 / 10
                    </span>
                  </div>
                  <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#8b5cf6] w-full shadow-inner" />
                  </div>
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
