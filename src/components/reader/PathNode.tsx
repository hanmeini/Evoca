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
  evoca1: { bg: "bg-[#ddd6fe]", border: "border-[#ddd6fe]", ring: "#8b5cf6", text: "text-[#7c3aed]", bubble: "border-[#ddd6fe] text-[#7c3aed]", bgValue: "#8b5cf6", header: "#a78bfa" }, // Violet
  evoca2: { bg: "bg-[#c7d2fe]", border: "border-[#c7d2fe]", ring: "#6366f1", text: "text-[#4f46e5]", bubble: "border-[#c7d2fe] text-[#4f46e5]", bgValue: "#6366f1", header: "#818cf8" }, // Indigo
  evoca3: { bg: "bg-[#bfdbfe]", border: "border-[#bfdbfe]", ring: "#3b82f6", text: "text-[#2563eb]", bubble: "border-[#bfdbfe] text-[#2563eb]", bgValue: "#3b82f6", header: "#60a5fa" }, // Blue
  evoca4: { bg: "bg-[#fce7f3]", border: "border-[#fce7f3]", ring: "#d946ef", text: "text-[#c026d3]", bubble: "border-[#fce7f3] text-[#c026d3]", bgValue: "#d946ef", header: "#f472b6" }, // Pink
  evoca5: { bg: "bg-[#e0f2fe]", border: "border-[#e0f2fe]", ring: "#0ea5e9", text: "text-[#0284c7]", bubble: "border-[#e0f2fe] text-[#0284c7]", bgValue: "#0ea5e9", header: "#38bdf8" }, // Sky
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

      {/* Hover Info Bubble Chat - Short & Compact version */}
      <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 min-w-[140px] max-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-[100] ease-out translate-y-3 group-hover:translate-y-0 pointer-events-none">
        <div
          className={cn(
            "bg-white/95 backdrop-blur-md border-[3px] rounded-[2rem] p-3 shadow-xl relative text-center",
            isLocked ? "border-stone-100" : t.border
          )}
        >
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "text-[7px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg w-fit mx-auto mb-0.5 shadow-sm",
                isLocked ? "bg-stone-100 text-stone-400" : cn(t.bg, t.text)
              )}
            >
              {isLocked ? "Terkunci" : (specialType === "monster" ? "Bos" : specialType === "chest" ? "Hadiah" : "Materi")}
            </span>
            <h3 className="text-[11px] font-bold text-stone-900 leading-tight px-1 line-clamp-1">
              {title}
            </h3>
          </div>
          {/* Smaller Triangle Pointer */}
          <div
            className={cn(
              "absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-4 h-4 border-b-[3px] border-r-[3px] bg-white/95 rotate-45 rounded-br-sm",
              isLocked ? "border-stone-100" : t.border
            )}
          />
        </div>
      </div>
    </div>
  );
}
