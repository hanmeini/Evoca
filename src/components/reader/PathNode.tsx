"use client";

import { cn } from "@/src/lib/utils";
import { Check, LucideIcon, Sword, Gift, Zap, Lock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PathNodeProps {
  id?: string;
  type: "document" | "new";
  progress: number; // 0 to 100
  title: string;
  icon: LucideIcon;
  status: "locked" | "current" | "completed";
  sideOffset?: "left" | "right" | "center";
  href?: string;
  onClick?: () => void;
  specialType?: "monster" | "chest" | "gem";
  isTooltipVisible?: boolean;
  theme?: "evoca1" | "evoca2" | "evoca3" | "evoca4" | "evoca5";
  subProgress?: string; // e.g. "1/4"
  pdfUrl?: string;
}

export const THEMES = {
  evoca1: { bg: "bg-[#ddd6fe]", border: "border-[#8b5cf6]", ring: "#8b5cf6", text: "text-[#7c3aed]", bubble: "border-[#ddd6fe] text-[#7c3aed]", bgValue: "#8b5cf6", header: "#a78bfa" }, // Violet
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
  onClick,
  specialType,
  isTooltipVisible = true,
  theme = "evoca1",
  subProgress,
  pdfUrl,
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
    "relative flex items-center justify-center w-16 h-16 rounded-full z-10",
    isLocked
      ? "bg-stone-200 text-stone-400 border-b-[5px] border-stone-300"
      : cn(t.bg, t.text, "border-b-[5px]", t.border, "shadow-lg ring-[6px] ring-white/20 shadow-black/5"),
  );

  const ringColor = t.ring;

  // Use dummy icons if special type is set
  const NodeIcon = isLocked ? Lock : (specialType === "monster" ? Sword : specialType === "chest" ? Gift : specialType === "gem" ? Gift : Icon);

  const renderContent = () => {
    const inner = (
      <div className="flex items-center justify-center transition-transform group-hover:scale-110 relative z-10">
        <NodeIcon
          className={cn(
            "w-6 h-6 outline-none",
            isNew ? "stroke-[4px]" : "stroke-[3px]",
          )}
        />
      </div>
    );

    const checkmark = (
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
              delay: 1.5
            }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 rounded-full flex items-center justify-center shadow-sm z-20"
            style={{ borderColor: t.ring, color: t.ring }}
          >
            <Check className="w-4 h-4 stroke-[4px]" />
          </motion.div>
        )}
      </AnimatePresence>
    );

    if (isLocked) {
      return (
        <div className={circleClasses}>
          <NodeIcon className="w-6 h-6 opacity-30" />
        </div>
      );
    }

    if (onClick) {
      return (
        <button onClick={(e) => { e.preventDefault(); onClick(); }} className={cn(circleClasses, "cursor-pointer outline-none")}>
          {inner}
          {checkmark}
        </button>
      );
    }

    if (href) {
      return (
        <Link href={href} className={circleClasses}>
          {inner}
          {checkmark}
        </Link>
      );
    }

    return (
      <div className={circleClasses}>
        {inner}
        {checkmark}
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      {/* "MULAI" Tooltip for Current Node */}
      {isCurrent && isTooltipVisible && (
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest z-[60] shadow-lg group-hover:opacity-0 group-hover:-translate-y-2 transition-opacity duration-300"
          style={{ backgroundColor: t.bgValue }}
        >
          {specialType === "monster" ? "LAWAN!" : specialType === "chest" ? "BUKA!" : specialType === "gem" ? "DAPETIN!" : "MULAI"}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ backgroundColor: t.bgValue }}
          />
        </motion.div>
      )}

      {/* Wrapper to Perfectly Center Circle & SVG Ring */}
      <div className="relative flex items-center justify-center w-16 h-16 z-20">
        {/* Progress SVG Ring */}
        {!isNew && !isLocked && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex items-center justify-center">
            <svg viewBox="0 0 84 84" className="w-[84px] h-[84px] transform -rotate-90 drop-shadow-sm">
              <circle
                stroke="rgba(0,0,0,0.06)"
                fill="transparent"
                strokeWidth={stroke}
                r={radius}
                cx="42"
                cy="42"
              />
              <motion.circle
                stroke={ringColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  delay: 0.2
                }}
                strokeLinecap="round"
                r={radius}
                cx="42"
                cy="42"
              />
            </svg>
          </div>
        )}

        {/* Main Node Content */}
        {renderContent()}
      </div>

      {/* Hover Info Bubble Chat - Tiny version */}
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 min-w-[110px] max-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-[100] ease-out translate-y-2 group-hover:translate-y-0 pointer-events-none">
        <div
          className={cn(
            "bg-white/95 backdrop-blur-md border-2 rounded-[1.25rem] p-2 shadow-xl relative text-center",
            isLocked ? "border-stone-100" : t.border
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span
              className={cn(
                "text-[6px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md w-fit mx-auto mb-0.5 shadow-sm",
                isLocked ? "bg-stone-100 text-stone-400" : cn(t.bg, t.text)
              )}
            >
              {isLocked ? "Terkunci" : (
                isCurrent ? (subProgress === "0/4" ? "Tahap 1: Ringkasan" :
                  subProgress === "1/4" ? "Tahap 2: Kuis" :
                  subProgress === "2/4" ? "Tahap 3: Podcast" :
                  subProgress === "3/4" ? "Tahap 4: Chat" :
                  "Materi") :
                  (specialType === "monster" ? "Bos" : specialType === "chest" ? "Hadiah" : specialType === "gem" ? "Permata" : "Materi")
              )}
            </span>
            <h3 className="text-[10px] font-bold text-stone-900 leading-tight px-1 line-clamp-1">
              {title}
            </h3>
            {subProgress && (
              <p className={cn("text-[8px] font-black mt-0.5", t.text)}>
                {subProgress} Selesai
              </p>
            )}
          </div>
          {/* Smaller Triangle Pointer */}
          <div
            className={cn(
              "absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 border-b-2 border-r-2 bg-white/95 rotate-45 rounded-br-sm",
              isLocked ? "border-stone-100" : t.border
            )}
          />
        </div>
      </div>
    </div>
  );
}
