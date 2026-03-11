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
}: PathNodeProps) {
  // SVG Circle calculations (Now based on 0-100 coordinate system)
  const stroke = 8;
  const radius = 42;
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
    "relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 z-10",
    isLocked
      ? "bg-stone-100 text-stone-200"
      : "bg-white text-[#8b5cf6] shadow-xl border-b-8 border-stone-200 ring-8 ring-white/20",
    isNew && "bg-[#a78bfa] text-white border-[#8b5cf6] ring-[#a78bfa]/20 animate-pulse",
  );

  const ringColor = isCompleted ? "#f97316" : "#8b5cf6";

  // Use dummy icons if special type is set
  const NodeIcon = specialType === "monster" ? Sword : specialType === "chest" ? Gift : Icon;

  return (
    <div className={containerClasses}>
      {/* "MULAI" Tooltip for Current Node */}
      {isCurrent && !isNew && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#8b5cf6] text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest animate-bounce z-30">
          {specialType === "monster" ? "LAWAN!" : specialType === "chest" ? "BUKA!" : "MULAI"}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#8b5cf6] rotate-45" />
        </div>
      )}

      {/* Progress SVG Ring (Perfectly Centered) */}
      {!isNew && !isLocked && (
        <div className="absolute inset-0 -m-4 pointer-events-none z-20">
          <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
            {/* Background Track */}
            <circle
              stroke="rgba(0,0,0,0.05)"
              fill="transparent"
              strokeWidth={stroke}
              r={radius}
              cx="50"
              cy="50"
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
              cx="50"
              cy="50"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
        </div>
      )}

      {/* Locked Overlay for locked nodes */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-50">
          <div className="w-24 h-24 bg-stone-200/50 rounded-full" />
        </div>
      )}

      {/* Main Node Circle */}
      {isLocked ? (
        <div className={circleClasses}>
          <NodeIcon className="w-10 h-10 opacity-30" />
        </div>
      ) : (
        <Link href={href} className={circleClasses}>
          <div
            className={cn(
              "flex items-center justify-center transition-transform group-hover:scale-110",
              isNew && "group-hover:rotate-90 duration-300",
            )}
          >
            <NodeIcon
              className={cn(
                "w-10 h-10",
                isNew ? "stroke-[4px]" : "stroke-[3px]",
                specialType === "monster" && "text-red-500",
                specialType === "chest" && "text-amber-500",
              )}
            />
          </div>

          {/* Status Indicator (Checkmark) */}
          {isCompleted && (
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-white border-2 border-[#f97316] rounded-full flex items-center justify-center text-[#f97316] shadow-sm animate-in zoom-in duration-300">
              <Check className="w-5 h-5 stroke-[4px]" />
            </div>
          )}
        </Link>
      )}

      {/* Label - Hidden by user request */}
      <div className="mt-8 text-center max-w-[120px] invisible group-hover:visible h-0 opacity-0 group-hover:opacity-100 transition-all">
        <h3
          className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            isLocked ? "text-stone-300" : "text-stone-900",
          )}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}
