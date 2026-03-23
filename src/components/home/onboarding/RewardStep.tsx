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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-indigo-950/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        className="w-full max-w-lg relative z-10 mt-20 md:mt-32"
      >
        {/* The Mascot Breaking Out (Huge Size) */}
        <div className="absolute -top-40 md:-top-56 left-1/2 -translate-x-1/2 w-64 h-64 md:w-80 md:h-80 lg:w-88 lg:h-88 z-20 pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           {/* Glowing aura */}
           <div className={`absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse ${currentMascot.bg}`} />
           
           <motion.div
             animate={{ y: [-8, 8, -8] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="w-full h-full relative z-10"
           >
             <Image src={currentMascot.image} alt={currentMascot.name} fill className="object-contain" priority />
           </motion.div>

           {/* Floating Trophy Badge overlapping mascot */}
           <motion.div 
             initial={{ scale: 0, rotate: -45 }}
             animate={{ scale: 1, rotate: 0 }}
             transition={{ type: "spring", bounce: 0.6, delay: 0.4 }}
             className="absolute bottom-4 right-0 md:bottom-8 md:right-8 bg-linear-to-br from-yellow-300 to-yellow-500 p-3 md:p-4 rounded-full shadow-[0_10px_30px_rgba(250,204,21,0.6)] border-4 border-white z-30"
           >
             <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-sm" strokeWidth={2.5} />
           </motion.div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-4xl p-8 md:p-12 pt-34 md:pt-40 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden text-center group">
          
          {/* Subtle dots pattern for elegance + game feel */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 2px, transparent 0)", backgroundSize: "24px 24px" }} />
          
          {/* Faint top highlight */}
          <div className="absolute top-0 inset-x-0 h-48 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

          {/* Glowing animated border effect on inner edges */}
          <div className="absolute inset-0 rounded-4xl border-2 border-transparent bg-clip-border group-hover:border-white/10 transition-colors pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-xs md:text-sm uppercase tracking-widest backdrop-blur-md shadow-inner"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Target Dikunci
              </motion.div>
              
              <h2 
                style={STROKE_STYLE}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent uppercase tracking-tight drop-shadow-xl"
              >
                Siap Beraksi!
              </h2>
              
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner relative z-20">
                <p className="text-white/90 font-medium text-sm md:text-base leading-relaxed">
                  Partner barumu <span className="font-black text-white px-1 relative z-10">{currentMascot.name}</span> siap memandumu berpetualang. Tantangan baru telah menanti!
                </p>
              </div>
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
