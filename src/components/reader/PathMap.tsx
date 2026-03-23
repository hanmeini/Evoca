"use client";

import {
  Star,
  Check,
  Lock,
  Play,
  BookOpen,
  Brain,
  Headphones,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { THEMES } from "@/src/components/reader/PathNode";

export interface PathStage {
  id: number;
  type: "summary" | "quiz" | "podcast" | "chat";
  label: string;
  href: string;
  status: "locked" | "current" | "completed";
}

interface PathMapProps {
  stages: PathStage[];
  title: string;
  materiNumber?: number;
  theme?: keyof typeof THEMES;
}

export function PathMap({ stages, title, materiNumber = 1, theme = "evoca1" }: PathMapProps) {
  const t = THEMES[theme];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-8 relative">
      {/* Unit Header dynamically styled by selected Evoca theme */}
      <div 
        className="w-full rounded-3xl p-6 text-white mb-12 shadow-lg border-b-8 border-black/20 relative z-20"
        style={{ backgroundColor: t.bgValue }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
              {materiNumber % 5 === 0 ? `UJIAN UNIT ${materiNumber / 5}` : `MATERI ${materiNumber}`}
            </p>
            <h3 className="font-black text-xl leading-tight line-clamp-2">
              {title}
            </h3>
          </div>
          <div className="shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Path line background - starts right from header bottom */}
      <div className="absolute top-[132px] bottom-0 w-3 bg-stone-200 left-1/2 -translate-x-1/2 z-0">
        {/* Fill animation - precise and smooth */}
        <motion.div 
          initial={{ height: "0%" }}
          animate={{ 
            height: (() => {
              const currentIndex = stages.findIndex(s => s.status === "current");
              const completedCount = stages.filter(s => s.status === "completed").length;
              
              if (completedCount === stages.length) return "100%";
              
              // targetIndex defines which button center we should reach
              const targetIndex = currentIndex !== -1 ? currentIndex : completedCount;
              
              /**
               * CALCULATION LOGIC:
               * 1. Header margin-bottom: 48px (mb-12)
               * 2. First button center: 40px (half of 80px h-20)
               * 3. Total offset for first button: 48 + 40 = 88px
               * 4. Each subsequent button step: 80px (button) + 80px (gap/space-y-20) = 160px
               */
              return `calc(88px + ${targetIndex * 160}px)`;
            })()
          }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 w-full"
          style={{ backgroundColor: t.bgValue }}
        >
          {/* Progress Tip Glow */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full blur-xl opacity-40 animate-pulse"
            style={{ backgroundColor: t.bgValue }}
          />
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white/80 shadow-lg"
            style={{ backgroundColor: t.bgValue }}
          />
        </motion.div>
      </div>

      <div className="space-y-20 w-full relative z-10 px-4">
        {stages.map((stage, index) => {
          const isEven = index % 2 === 0;
          const Icon = getIcon(stage.type);

          return (
            <div
              key={`${stage.id}-${index}`}
              className={cn(
                "flex items-center w-full",
                isEven ? "flex-row" : "flex-row-reverse",
              )}
            >
              {/* Connector dot for path flow (snake effect) */}
              <div className="flex-1" />

              <div className="relative group">


                <Link
                  href={stage.status === "locked" ? "#" : stage.href}
                  className={cn(
                    "flex items-center justify-center w-20 h-20 rounded-[2.5rem] transition-all duration-300 relative border-b-[6px]",
                    stage.status === "completed"
                      ? cn(t.bg, t.border, t.text)
                      : stage.status === "current"
                        ? cn(t.bg, t.border, t.text, "shadow-lg scale-110 active:translate-y-1 active:border-b-0")
                        : "bg-[#e5e5e5] border-[#afafaf] text-[#afafaf] cursor-not-allowed",
                  )}
                >
                  {stage.status === "completed" ? (
                    <Check className="w-6 h-6 sm:w-8 sm:h-8 stroke-[4px]" />
                  ) : stage.status === "locked" ? (
                    <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
                  ) : (
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3px]" />
                  )}

                  {/* Ring highlight for current */}
                  {stage.status === "current" && (
                    <div className={cn("absolute inset-0 rounded-[2.5rem] border-[6px] scale-125 opacity-20 animate-ping", t.border)} />
                  )}
                </Link>

                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 font-black uppercase text-[10px] sm:text-[11px] tracking-widest leading-[1.4] w-max",
                    isEven ? "left-[90px] sm:left-24 text-left" : "right-[90px] sm:right-24 text-right",
                    stage.status === "locked"
                      ? "text-stone-300"
                      : "text-stone-900",
                  )}
                >
                  {stage.label.split(': ').map((part, i, arr) => (
                    <span key={i} className="block">
                      {part}{i < arr.length - 1 ? ':' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case "summary":
      return BookOpen;
    case "quiz":
      return Brain;
    case "podcast":
      return Headphones;
    case "chat":
      return MessageSquare;
    default:
      return Star;
  }
}
