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
import { cn } from "@/src/lib/utils";

interface PathStage {
  id: number;
  type: "summary" | "quiz" | "podcast" | "chat";
  label: string;
  href: string;
  status: "locked" | "current" | "completed";
}

interface PathMapProps {
  stages: PathStage[];
  title: string;
  unitNumber?: number;
}

export function PathMap({ stages, title, unitNumber = 1 }: PathMapProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-8 relative">
      {/* Unit Header inspired by user screenshot */}
      <div className="w-full bg-[#58cc02] rounded-3xl p-6 text-white mb-12 shadow-md border-b-8 border-black/10 relative z-20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
              BAGIAN 1, UNIT {unitNumber}
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

      {/* Path line background */}
      <div className="absolute top-24 bottom-0 w-3 bg-stone-200 left-1/2 -translate-x-1/2 z-0 rounded-full" />

      <div className="space-y-16 w-full relative z-10">
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
                {/* Tooltip for current stage */}
                {stage.status === "current" && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest animate-bounce whitespace-nowrap z-20">
                    MULAI
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 rotate-45" />
                  </div>
                )}

                <Link
                  href={stage.status === "locked" ? "#" : stage.href}
                  className={cn(
                    "flex items-center justify-center w-20 h-20 rounded-[2.5rem] transition-all duration-300 relative border-b-[6px]",
                    stage.status === "completed"
                      ? "bg-[#ffc800] border-[#e5a500] text-white"
                      : stage.status === "current"
                        ? "bg-[#58cc02] border-[#46a302] text-white shadow-lg scale-110 active:translate-y-1 active:border-b-0"
                        : "bg-[#e5e5e5] border-[#afafaf] text-[#afafaf] cursor-not-allowed",
                  )}
                >
                  {stage.status === "completed" ? (
                    <Check className="w-8 h-8 stroke-[4px]" />
                  ) : stage.status === "locked" ? (
                    <Lock className="w-8 h-8" />
                  ) : (
                    <Icon className="w-8 h-8 stroke-[3px]" />
                  )}

                  {/* Ring highlight for current */}
                  {stage.status === "current" && (
                    <div className="absolute inset-0 rounded-[2.5rem] border-[6px] border-[#58cc02] scale-125 opacity-20 animate-ping" />
                  )}
                </Link>

                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase text-[10px] tracking-widest",
                    isEven ? "left-24" : "right-24",
                    stage.status === "locked"
                      ? "text-stone-300"
                      : "text-stone-900",
                  )}
                >
                  {stage.label}
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
