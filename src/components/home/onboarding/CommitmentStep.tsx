import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Leaf, Flame, Zap, Shield } from "lucide-react";
import Image from "next/image";
import { MascotType, CommitmentLevel } from "./types";
import { STROKE_STYLE, MASCOTS } from "./constants";

interface CommitmentStepProps {
  selectedMascot: MascotType;
  commitment: CommitmentLevel | null;
  setCommitment: (c: CommitmentLevel) => void;
  setStep: (s: number) => void;
}

const COMMITMENT_OPTIONS = [
  {
    id: "santai",
    label: "Mode Santai",
    time: "10 Min/Hari",
    xp: "XP Normal",
    color: "from-emerald-400 to-emerald-600",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.4)]",
    ring: "ring-emerald-400",
    icon: Leaf,
    desc: "Perjalanan santai cocok untuk pemula.",
  },
  {
    id: "serius",
    label: "Mode Serius",
    time: "30 Min/Hari",
    xp: "2x XP Drop",
    color: "from-orange-400 to-orange-600",
    glow: "shadow-[0_0_30px_rgba(251,146,60,0.4)]",
    ring: "ring-orange-400",
    icon: Flame,
    desc: "Tantangan seimbang untuk hasil progresif.",
  },
  {
    id: "hardcore",
    label: "Mode Hardcore",
    time: "60 Min/Hari",
    xp: "3x Legendary Drop",
    color: "from-rose-500 to-rose-700",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.4)]",
    ring: "ring-rose-500",
    icon: Zap,
    desc: "Latihan intensif untuk para juara sejati!",
  },
];

export const CommitmentStep = ({
  selectedMascot,
  commitment,
  setCommitment,
  setStep,
}: CommitmentStepProps) => {
  const currentMascot = MASCOTS.find((m) => m.id === selectedMascot) || MASCOTS[0];

  return (
    <motion.div
      key="step6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-4 md:px-8 max-w-7xl mx-auto py-12"
    >
      {/* Kiri: Avatar & Info */}
      <div className="hidden md:flex flex-col items-center justify-center w-full md:w-5/12 relative">
        <motion.div 
           animate={{ y: [-10, 10, -10] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="relative aspect-square w-full max-w-sm rounded-[3rem] border-4 border-white/20 bg-white/5 backdrop-blur-lg shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden group"
        >
           {/* Background Glow */}
           <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-3xl ${currentMascot.bg}`} />
           
           <div className="relative w-full h-full min-h-[250px] flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500">
             <Image 
               src={currentMascot.image} 
               alt={currentMascot.name} 
               fill 
               className="object-contain" 
               draggable={false}
             />
           </div>
        </motion.div>
        
        {/* User Card Info */}
        <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-sm flex items-center gap-4 text-white shadow-xl">
           <div className="w-14 h-14 rounded-full bg-indigo-900/50 flex items-center justify-center border-2 border-indigo-300">
              <Shield className="w-8 h-8 text-indigo-300" />
           </div>
           <div>
              <p className="text-white/60 font-bold text-xs uppercase tracking-widest">Partner Aktif</p>
              <h3 className="text-2xl font-black uppercase tracking-wide">{currentMascot.name}</h3>
           </div>
        </div>
      </div>

      {/* Kanan: Pilihan Mode */}
      <div className="w-full md:w-7/12 flex flex-col space-y-6 md:space-y-8 z-10 p-2 md:p-0">
        <div className="text-center md:text-left space-y-2">
          <h1 
            style={STROKE_STYLE}
            className="text-4xl md:text-6xl font-black text-transparent uppercase leading-tight tracking-tighter drop-shadow-lg"
          >
            Pilih Mode Belajar
          </h1>
          <p className="text-white/80 font-bold text-sm md:text-base tracking-widest uppercase">
            Sistem rank dan xp menyesuaikan pilihanmu.
          </p>
        </div>

        <div className="space-y-4">
          {COMMITMENT_OPTIONS.map((opt) => {
            const isSelected = commitment === opt.id;
            const Icon = opt.icon;
            
            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={opt.id}
                onClick={() => setCommitment(opt.id as CommitmentLevel)}
                className={`w-full relative overflow-hidden rounded-3xl p-[2px] text-left transition-all duration-300 group ${
                  isSelected 
                    ? `ring-4 ${opt.ring} ${opt.glow}` 
                    : "hover:bg-white/5"
                }`}
              >
                {/* Background Gradient for selected */}
                {isSelected ? (
                  <div className={`absolute inset-0 bg-linear-to-r ${opt.color} opacity-40`} />
                ) : (
                  <div className={`absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl`} />
                )}

                <div className={`relative z-10 p-5 md:p-6 rounded-[calc(1.5rem-2px)] flex items-center gap-4 md:gap-6 ${isSelected ? 'bg-black/20 text-white border border-white/10' : 'text-white/80 border border-white/10 hover:border-white/30'} transition-colors`}>
                  {/* Icon Box */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                    isSelected ? `bg-linear-to-br ${opt.color} text-white` : 'bg-white/10 text-white/50 group-hover:text-white/80 group-hover:bg-white/20'
                  } transition-all`}>
                    <Icon strokeWidth={isSelected ? 3 : 2} className="w-7 h-7 md:w-8 md:h-8 drop-shadow-md" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-xl md:text-2xl font-black uppercase tracking-wide ${isSelected ? 'text-white' : 'text-white/90'}`}>
                        {opt.label}
                      </h3>
                      <span className={`text-xs md:text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${isSelected ? 'bg-white text-indigo-900 border border-white/50' : 'bg-white/10 text-white/60 border border-transparent'}`}>
                        {opt.time}
                      </span>
                    </div>
                    <p className={`text-sm md:text-base font-medium ${isSelected ? 'text-white/90' : 'text-white/50'}`}>
                      {opt.desc}
                    </p>
                    
                    {/* XP Tag */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="flex items-center gap-2 overflow-hidden"
                        >
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/20 text-yellow-300 text-[10px] md:text-xs font-black uppercase tracking-widest border border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                            ⭐ {opt.xp}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="pt-6 flex justify-end">
          <button
            disabled={!commitment}
            onClick={() => setStep(7)}
            className={`w-full md:w-auto px-10 py-5 md:py-6 rounded-full font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 group ${
              commitment
                ? "bg-white text-indigo-700 hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] border-4 border-indigo-200"
                : "bg-white/10 text-white/30 cursor-not-allowed border-4 border-transparent"
            }`}
          >
            LANJUTKAN
            <ArrowRight className={`w-6 h-6 md:w-7 md:h-7 transition-transform ${commitment ? 'group-hover:translate-x-2' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

