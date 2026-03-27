import React from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Sparkles } from "lucide-react";
import Image from "next/image";
import { MascotType, CommitmentLevel } from "./types";
import { MASCOTS, STROKE_STYLE } from "./constants";

interface RewardStepProps {
  selectedMascot: MascotType;
}

export const RewardStep = ({ selectedMascot }: RewardStepProps) => {
  const currentMascot = MASCOTS.find((m) => m.id === selectedMascot) || MASCOTS[0];

  return (
    <motion.div
      key="step7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-linear-to-br from-indigo-950 via-indigo-900 to-black/90 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        className="w-full max-w-lg relative z-10 mt-20 md:mt-32"
      >
        {/* The Mascot Breaking Out (Huge Size) */}
        <div className="absolute -top-28 md:-top-44 left-1/2 -translate-x-1/2 w-64 h-64 md:w-80 md:h-80 lg:w-88 lg:h-88 z-20 pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           {/* Glowing aura */}
           <div className={`absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse ${currentMascot.bg}`} />
           
           <motion.div
             animate={{ y: [-8, 8, -8] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="w-full h-full relative z-10"
           >
             <Image src={currentMascot.image} alt={currentMascot.name} fill className="object-contain" priority />
           </motion.div>


        </div>

        <div className="bg-linear-to-b from-indigo-600/40 to-indigo-900/60 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 md:p-10 pt-28 md:pt-36 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden text-center group">
          
          {/* Subtle dots pattern for elegance + game feel */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 2px, transparent 0)", backgroundSize: "24px 24px" }} />
          
          {/* Faint top highlight */}
          <div className="absolute top-0 inset-x-0 h-48 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

          {/* Glowing animated border effect on inner edges */}
          <div className="absolute inset-0 rounded-4xl border-2 border-transparent bg-clip-border group-hover:border-white/10 transition-colors pointer-events-none" />

          <div className="relative z-10 space-y-6">
            

              
              <h2 
                style={STROKE_STYLE}
                className="text-4xl md:text-6xl font-black text-transparent uppercase tracking-tight drop-shadow-2xl"
              >
                Siap Beraksi!
              </h2>
              
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-inner relative z-20">
                <p className="text-white/90 font-medium text-base md:text-lg leading-relaxed">
                  Selamat! <span className="font-medium text-indigo-300">{currentMascot.name}</span> kini menjadi partnermu. Ayo mulai petualangan belajarmu sekarang!
                </p>
              </div>

            {/* Action Button - Vibrant but cleanly integrated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-2 relative z-30"
            >
              <button
                onClick={() => (window.location.href = "/register")}
                className="w-full relative overflow-hidden rounded-2xl p-[2px] active:scale-[0.98] transition-all group/btn"
              >
                <div className="absolute inset-0 bg-linear-to-r from-indigo-400 via-purple-400 to-indigo-400 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                <div className="relative bg-white text-indigo-900 py-4 w-full rounded-[calc(1rem-2px)] font-black text-lg flex items-center justify-center gap-3 shadow-lg group-hover/btn:bg-stone-50 transition-colors">
                  <Target className="w-6 h-6 text-indigo-600" />
                  MULAI SEKARANG
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
