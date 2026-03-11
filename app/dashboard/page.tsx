"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { PathNode } from "@/src/components/reader/PathNode";
import { Bell, Sparkles, Search, Plus, BookOpen } from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/history");
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
  }, []);

  const calculateProgress = (doc: DocumentHistory) => {
    let completedSteps = 0;
    if (doc.metadata?.summary) completedSteps += 1;
    if (doc.quizData) completedSteps += 1;
    if (doc.podcastScript) completedSteps += 1;
    if (doc.chatHistory && doc.chatHistory.length > 0) completedSteps += 1;
    return (completedSteps / 4) * 100;
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen pb-32 font-sans overflow-x-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200 px-4 md:px-8 py-4">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-xl shadow-lg border-b-4 border-indigo-700">
              🧑🏽‍🦱
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-stone-900 leading-none">
                EVOCA
              </h1>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">
                Adventure Mode
              </p>
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
                {/* Zig-Zag Connectors Background - More Curved & Compact */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-full pointer-events-none opacity-10">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 200 4000"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M100,0 Q280,320 100,640 Q-80,960 100,1280 Q280,1600 100,1920 Q-80,2240 100,2560 Q280,2880 100,3200 Q-80,3520 100,3840"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="12"
                      strokeDasharray="20 25"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Path Units */}
                {history.length > 0 && (
                  <div className="flex flex-col items-center w-full space-y-0 relative z-10">
                    {/* Reverse history as before */}
                    {[...history].reverse().map((doc, idx) => {
                      const progress = calculateProgress(doc);
                      
                      // Units of 5
                      const unitIndex = Math.floor(idx / 5);
                      const positionInUnit = idx % 5;
                      const isMonsterNode = positionInUnit < 4;

                      // Stronger Curved Offset Logic
                      const isUnitEven = unitIndex % 2 === 0;
                      const baseOffsets = [0, 100, 140, 100, 0];
                      const xOffset = isUnitEven 
                        ? baseOffsets[positionInUnit] 
                        : -baseOffsets[positionInUnit];

                      return (
                        <div
                          key={doc.id}
                          className="relative w-full flex flex-col items-center py-4"
                        >
                          {/* Monster Mascot - Placed at node 2 (peak) */}
                          {positionInUnit === 2 && (
                            <div
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 hidden md:block z-0",
                                isUnitEven ? "-left-32" : "-right-32"
                              )}
                            >
                              <div className="relative w-56 h-56 group">
                                <video
                                  src="/animations/mascot-yeti.mp4"
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-contain drop-shadow-2xl translate-y-4"
                                />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-1.5 rounded-2xl border border-stone-200 shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 origin-bottom">
                                  <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-tighter">YETI BOSS</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div 
                            style={{ 
                              transform: `translateX(${xOffset}px)`,
                              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                            }}
                          >
                            <PathNode
                              type="document"
                              progress={progress}
                              title={doc.metadata?.title || doc.fileName}
                              icon={BookOpen}
                              status={progress === 100 ? "completed" : "current"}
                              href={`/ai-reader/${doc.id}`}
                              specialType={isMonsterNode ? "monster" : "chest"}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Progression/Unlock Logic for 'New Mission' */}
                {(() => {
                  const lastDoc = history[0]; // history[0] is newest in original array
                  const isLastComplete =
                    history.length === 0 || calculateProgress(lastDoc) === 100;
                  const nextIdx = history.length;
                  const offsets: ("center" | "right" | "center" | "left")[] = [
                    "center",
                    "right",
                    "center",
                    "left",
                  ];
                  const offset = offsets[nextIdx % 4];

                  return (
                    <div className="pt-24 scale-110">
                      <PathNode
                        type="new"
                        progress={0}
                        title="Misi Baru"
                        icon={Plus}
                        status={isLastComplete ? "current" : "locked"}
                        sideOffset={offset}
                        href="/dashboard/new"
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:flex flex-col gap-6 ">
          {/* Streak Card - Video Mascot Edition */}
          <div className="bg-white rounded-[2rem] p-6 text-center">
            {/* Mascot Video */}
            <div className="w-48 h-48 mx-auto relative mb-4">
              <video
                src="/animations/mascot-yeti.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain mix-blend-multiply"
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
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <span className="text-[10px] font-black text-stone-900 uppercase">
                      Dapatkan 10 XP
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-orange-600">
                    10 / 10
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 w-full shadow-inner" />
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
  );
}
