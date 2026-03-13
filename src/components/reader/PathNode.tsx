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
  theme?: "evoca1" | "evoca2" | "evoca3" | "evoca4" | "evoca5";
}

export const THEMES = {
  evoca1: { bg: "bg-[#ddd6fe]", border: "border-[#8b5cf6]", ring: "#8b5cf6", text: "text-[#7c3aed]", bubble: "border-[#ddd6fe] text-[#7c3aed]", bgValue: "#8b5cf6" }, // Pastel Violet
  evoca2: { bg: "bg-[#c7d2fe]", border: "border-[#6366f1]", ring: "#6366f1", text: "text-[#4f46e5]", bubble: "border-[#c7d2fe] text-[#4f46e5]", bgValue: "#6366f1" }, // Pastel Indigo
  evoca3: { bg: "bg-[#bfdbfe]", border: "border-[#3b82f6]", ring: "#3b82f6", text: "text-[#2563eb]", bubble: "border-[#bfdbfe] text-[#2563eb]", bgValue: "#3b82f6" }, // Pastel Blue
  evoca4: { bg: "bg-[#f5d0fe]", border: "border-[#d946ef]", ring: "#d946ef", text: "text-[#c026d3]", bubble: "border-[#f5d0fe] text-[#c026d3]", bgValue: "#d946ef" }, // Pastel Purple/Fuchsia
  evoca5: { bg: "bg-[#bae6fd]", border: "border-[#0ea5e9]", ring: "#0ea5e9", text: "text-[#0284c7]", bubble: "border-[#bae6fd] text-[#0284c7]", bgValue: "#0ea5e9" }, // Pastel Sky Blue
};

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
  theme = "evoca1",
}: PathNodeProps) {
  // SVG Circle calculations to perfectly wrap the w-16 h-16 (64px) button
  const stroke = 8;
  const radius = 35;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isNew = type === "new";
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const t = THEMES[theme];

  const containerClasses = cn(
    "relative flex flex-col items-center group transition-all duration-300",
    sideOffset === "left" && "-translate-x-12",
    sideOffset === "right" && "translate-x-12",
  );

  const circleClasses = cn(
    "relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 z-10",
    isLocked
      ? "bg-stone-200 text-stone-400 border-b-[5px] border-stone-300 ring-[6px] ring-transparent"
      : cn(t.bg, t.text, "border-b-[5px]", t.border, "ring-[6px] ring-white/20"),
    isNew && "animate-pulse",
  );

  const ringColor = isCompleted ? "#f97316" : t.ring;

  // Use dummy icons if special type is set
  const NodeIcon = specialType === "monster" ? Sword : specialType === "chest" ? Gift : Icon;

  return (
    <div className={containerClasses}>
      {/* "MULAI" Tooltip for Current Node (Hides on hover to make room for the info bubble) */}
      {isCurrent && !isNew && isTooltipVisible && (
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest animate-bounce z-[60] shadow-lg group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300"
          style={{ backgroundColor: t.bgValue }}
        >
          {specialType === "monster" ? "LAWAN!" : specialType === "chest" ? "BUKA!" : "MULAI"}
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" 
            style={{ backgroundColor: t.bgValue }}
          />
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
                stroke="rgba(0,0,0,0.12)"
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
                  "w-6 h-6 outline-none",
                  isNew ? "stroke-[4px]" : "stroke-[3px]",
                  // When the node is just solid color, text handles icon color, except special ones if we want.
                  // Default text implies text is white, so icons will be white.
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
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] ease-out translate-y-2 group-hover:translate-y-0">
        <div className={cn(
          "bg-white border-2 rounded-[2rem] p-4 shadow-2xl relative text-center",
          isLocked ? "border-stone-200 border-b-4" : cn("border-b-4", t.bubble.split(" ")[0])
        )}>
          <div className="flex flex-col gap-1">
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-[0.2em]",
              isLocked ? "text-stone-400" : t.bubble.split(" ")[1]
            )}>
              {isLocked ? "Terkunci" : (specialType === "monster" ? "Tantangan Bos" : specialType === "chest" ? "Hadiah" : "Materi")}
            </span>
            <h3 className="text-sm font-black text-stone-800 leading-tight">
              {title}
            </h3>
          </div>
          {/* Triangle Pointer */}
          <div className={cn(
            "absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 border-b-4 border-r-2 bg-white rotate-45",
            isLocked ? "border-stone-200" : t.bubble.split(" ")[0]
          )} />
        </div>
      </div>
    </div>
  );
}
