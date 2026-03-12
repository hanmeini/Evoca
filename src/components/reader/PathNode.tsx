"use client";

import { cn } from "@/src/lib/utils";
import { Check, LucideIcon, Sword, Gift } from "lucide-react";
import Link from "next/link";

interface PathNodeProps {
  id?: string;
  type: "document" | "new";
  progress: number; // 0 to 100
  title: string;
  icon: LucideIcon;
  status: "locked" | "current" | "completed";
  sideOffset?: "left" | "right" | "center";
  href: string;
  specialType?: "monster" | "chest";
  isTooltipVisible?: boolean;
}

export function PathNode({
  type,
  progress,
  title,
  icon: Icon,
  status,
  sideOffset = "center",
  href,
  specialType,
  isTooltipVisible = true,
}: PathNodeProps) {
  // SVG Circle calculations to perfectly wrap the w-16 h-16 (64px) button
  const stroke = 6;
  const radius = 35;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isNew = type === "new";
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isCurrent = status === "current";

  const containerClasses = cn(
    "relative flex flex-col items-center group transition-all duration-300",
    sideOffset === "left" && "-translate-x-12",
    sideOffset === "right" && "translate-x-12",
  );

  const circleClasses = cn(
    "relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 z-10",
    isLocked
      ? "bg-stone-100 text-stone-200"
      : "bg-white text-[#8b5cf6] shadow-xl border-b-[5px] border-stone-200 ring-[6px] ring-white/20",
    isNew && "bg-[#a78bfa] text-white border-[#8b5cf6] ring-[#a78bfa]/20 animate-pulse",
  );

  const ringColor = isCompleted ? "#f97316" : "#8b5cf6";

  // Use dummy icons if special type is set
  const NodeIcon = specialType === "monster" ? Sword : specialType === "chest" ? Gift : Icon;

  return (
    <div className={containerClasses}>
      {/* "MULAI" Tooltip for Current Node (Hides on hover to make room for the info bubble) */}
      {isCurrent && !isNew && isTooltipVisible && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#8b5cf6] text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest animate-bounce z-30 shadow-lg group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">
          {specialType === "monster" ? "LAWAN!" : specialType === "chest" ? "BUKA!" : "MULAI"}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#8b5cf6] rotate-45" />
        </div>
      )}

      {/* Wrapper to Perfectly Center Circle & SVG Ring */}
      <div className="relative flex items-center justify-center w-16 h-16 z-20">
        {/* Progress SVG Ring */}
        {!isNew && !isLocked && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex items-center justify-center">
            <svg viewBox="0 0 84 84" className="w-[84px] h-[84px] transform -rotate-90 drop-shadow-sm">
              {/* Background Track */}
              <circle
                stroke="rgba(0,0,0,0.08)"
                fill="transparent"
                strokeWidth={stroke}
                r={radius}
                cx="42"
                cy="42"
              />
              {/* Progress Bar */}
              <circle
                stroke={ringColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={radius}
                cx="42"
                cy="42"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        )}

        {/* Main Node Circle */}
        {isLocked ? (
          <div className={circleClasses}>
            <NodeIcon className="w-6 h-6 opacity-30" />
          </div>
        ) : (
          <Link href={href} className={circleClasses}>
            <div
              className={cn(
                "flex items-center justify-center transition-transform group-hover:scale-110 relative z-10",
                isNew && "group-hover:rotate-90 duration-300",
              )}
            >
              <NodeIcon
                className={cn(
                  "w-6 h-6",
                  isNew ? "stroke-[4px]" : "stroke-[3px]",
                  specialType === "monster" && "text-red-500",
                  specialType === "chest" && "text-amber-500",
                )}
              />
            </div>

            {/* Status Indicator (Checkmark) */}
            {isCompleted && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-[#f97316] rounded-full flex items-center justify-center text-[#f97316] shadow-sm animate-in zoom-in duration-300 z-20">
                <Check className="w-4 h-4 stroke-[4px]" />
              </div>
            )}
          </Link>
        )}
      </div>

      {/* Hover Info Bubble Chat */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 ease-out translate-y-2 group-hover:translate-y-0">
        <div className={cn(
          "bg-white border-2 rounded-2xl p-4 shadow-xl relative text-center",
          isLocked ? "border-stone-200" : "border-[#8b5cf6]"
        )}>
          <div className="flex flex-col gap-1.5">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isLocked ? "text-stone-400" : "text-[#8b5cf6]"
            )}>
              {isLocked ? "Terkunci" : (specialType === "monster" ? "Tantangan Bos" : specialType === "chest" ? "Hadiah" : "Materi")}
            </span>
            <h3 className="text-sm font-bold text-stone-800 leading-tight">
              {title}
            </h3>
          </div>
          {/* Triangle Pointer */}
          <div className={cn(
            "absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 border-b-2 border-r-2 bg-white rotate-45",
            isLocked ? "border-stone-200" : "border-[#8b5cf6]"
          )} />
        </div>
      </div>
    </div>
  );
}
