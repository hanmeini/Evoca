"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { MASCOTS, LOADING_LOGS } from "./constants";
import { RotatingTips } from "./SharedComponents";
import { MascotType } from "./types";

interface LoadingStepProps {
  loadingProgress: number;
  selectedMascot: MascotType;
}

// Generate particles (deterministic)
const PARTICLES = [...Array(20)].map((_, i) => ({
  id: i,
  x: i * 5,
  left: `${(i * 7) % 100}%`,
  duration: 2 + (i % 3),
  delay: (i % 4) * 0.5,
}));

export const LoadingStep = ({
  loadingProgress,
  selectedMascot,
}: LoadingStepProps) => {
  const currentMascot = MASCOTS.find((m) => m.id === selectedMascot);

  // ✅ SMOOTH COUNTER SETUP
  const motionValue = useMotionValue(0);

  const smoothValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 20,
  });

  const rounded = useTransform(smoothValue, (latest) =>
    Math.round(latest)
  );

  useEffect(() => {
    motionValue.set(loadingProgress);
  }, [loadingProgress, motionValue]);

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center gap-6 text-center p-6 relative overflow-hidden"
    >
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              x: Math.sin(p.x) * 50,
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
            className="absolute bottom-0 w-1 h-1 bg-white rounded-full"
            style={{ left: p.left }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-6 w-full max-w-2xl">
        {/* Mascot */}
        <div className="relative group">
          <motion.div
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-40 h-40 md:w-56 md:h-56 mx-auto relative drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {currentMascot && (
              <Image
                src={
                  selectedMascot === "tiger"
                    ? "/images/tiger-mascot.png"
                    : selectedMascot === "komodo"
                    ? "/images/komodo-mascot-new.png"
                    : "/images/badak-mascot.png"
                }
                alt="Loading Mascot"
                fill
                className="object-contain"
              />
            )}
          </motion.div>

          {/* Energy Ring */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-8 border-2 border-dashed border-white/20 rounded-full"
          />
        </div>

        {/* Text & Progress */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
              {loadingProgress < 100
                ? "Meracik Peta Quest..."
                : "Siap Bertualang!"}
            </h2>

            <motion.p
              key={Math.floor(loadingProgress / 15)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/60 font-black text-xs md:text-sm uppercase tracking-[0.3em]"
            >
              {
                LOADING_LOGS[
                  Math.min(
                    Math.floor(loadingProgress / 15),
                    LOADING_LOGS.length - 1
                  )
                ]
              }
            </motion.p>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="h-full bg-linear-to-r from-white/40 via-white to-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent skew-x-12"
                />
              </motion.div>
            </div>

            {/* ✅ SMOOTH COUNTER */}
            <div className="mt-4 h-24 md:h-36 flex items-center justify-center tabular-nums">
              <motion.div className="flex items-center text-white font-black text-7xl md:text-9xl tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                <motion.span
                  style={{
                    textShadow: "0 0 20px rgba(255,255,255,0.6)",
                  }}
                >
                  {rounded}
                </motion.span>
                <span className="ml-1">%</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
          <RotatingTips />
        </div>
      </div>
    </motion.div>
  );
};