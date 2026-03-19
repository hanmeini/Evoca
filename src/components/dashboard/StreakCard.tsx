"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/src/lib/utils";
import dynamic from "next/dynamic";

// Dynamic import for Lottie to avoid SSR issues
// Note: User needs to install 'lottie-react' (npm install lottie-react)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface StreakCardProps {
  initialStreak?: number;
  initialCompleted?: boolean;
}

export function StreakCard({ initialStreak = 5, initialCompleted = false }: StreakCardProps) {
  const [isQuestCompletedToday, setIsQuestCompletedToday] = useState(initialCompleted);
  const [showExplosion, setShowExplosion] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);

  // Fetch the Lottie JSON
  useEffect(() => {
    fetch("/animation/Fire.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load fire animation:", err));
  }, []);

  const handleCompleteQuest = () => {
    if (isQuestCompletedToday) return;

    // Trigger state change
    setIsQuestCompletedToday(true);
    
    // Trigger the "satisfying" explosion animation
    setShowExplosion(true);
    setTimeout(() => setShowExplosion(false), 2000); // Reset explosion state after animation
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Test Button (Manual Trigger for Demo) */}
      <button
        onClick={handleCompleteQuest}
        className={cn(
          "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_4px_0_0_#e2e8f0]",
          isQuestCompletedToday 
            ? "bg-stone-100 text-stone-400 cursor-not-allowed" 
            : "bg-indigo-600 text-white hover:-translate-y-1 hover:shadow-[0_6px_0_0_#4f46e5] active:translate-y-0.5 active:shadow-none"
        )}
      >
        {isQuestCompletedToday ? "Misi Selesai ✓" : "Selesaikan Misi Pertama"}
      </button>

      <div className="bg-white border-2 border-stone-200 rounded-[2.5rem] p-8 text-center w-full max-w-sm relative overflow-hidden shadow-sm group">
        {/* Satisfying Explosion Effect (Option 1: Radial Pulse) */}
        <AnimatePresence>
          {showExplosion && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-400/30 rounded-full blur-2xl z-0 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Option 2: Particles Explosion */}
        <AnimatePresence>
          {showExplosion && (
            <div className="absolute inset-0 pointer-events-none z-0">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: "50%", y: "50%", scale: 1, opacity: 1 }}
                  animate={{ 
                    x: `${50 + (Math.random() - 0.5) * 150}%`, 
                    y: `${50 + (Math.random() - 0.5) * 150}%`,
                    scale: 0,
                    opacity: 0 
                  }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="absolute w-2 h-2 bg-orange-500 rounded-full"
                  style={{ left: "0", top: "0" }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Fire Icon Container */}
        <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
          {/* Background Glow when Active */}
          <motion.div
            animate={{
              scale: isQuestCompletedToday ? [1, 1.1, 1] : 1,
              opacity: isQuestCompletedToday ? [0.2, 0.4, 0.2] : 0
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-4 bg-orange-400 rounded-full blur-[40px] z-0"
          />

          {/* Initial Grayscale State using Lucide as fallback or wrapper */}
          <div className={cn(
            "relative z-10 w-full h-full flex items-center justify-center transition-all duration-700 ease-out",
            isQuestCompletedToday ? "scale-110 rotate-0" : "grayscale opacity-40 scale-90"
          )}>
            {animationData && Lottie ? (
              <Lottie 
                animationData={animationData} 
                loop={true} 
                autoplay={isQuestCompletedToday}
                className="w-full h-full"
              />
            ) : (
              <Flame 
                className={cn(
                  "w-24 h-24 transition-colors duration-700",
                  isQuestCompletedToday ? "text-orange-500 fill-orange-500" : "text-stone-400"
                )} 
              />
            )}
          </div>

          {/* Flash Effect on Completion */}
          <AnimatePresence>
            {showExplosion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white rounded-full z-20 blur-xl pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Streak Text */}
        <div className="space-y-1 relative z-10 mt-4">
          <motion.h3 
            animate={isQuestCompletedToday ? {
              scale: [1, 1.1, 1],
              color: ["#1c1917", "#ea580c", "#1c1917"]
            } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl font-black text-stone-900 uppercase tracking-tight"
          >
            {initialStreak} HARI
          </motion.h3>
          <div className="flex items-center justify-center gap-2">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
              isQuestCompletedToday ? "text-orange-500" : "text-stone-400"
            )}>
              {isQuestCompletedToday ? "Streak Menyala! 🔥" : "Selesaikan 1 Misi Lagi"}
            </span>
          </div>
        </div>

        {/* Small decorative glow line */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 h-1 transition-all duration-1000 bg-linear-to-r",
          isQuestCompletedToday 
            ? "from-transparent via-orange-500 to-transparent opacity-100" 
            : "from-transparent via-stone-200 to-transparent opacity-0"
        )} />
      </div>

      <style jsx global>{`
        @keyframes fire-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(234, 88, 12, 0.4)); }
          50% { filter: drop-shadow(0 0 25px rgba(234, 88, 12, 0.8)); }
        }
        .animate-fire-active {
          animation: fire-glow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
