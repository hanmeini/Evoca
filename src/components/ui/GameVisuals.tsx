"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Shield, 
  Flame, 
  Coins, 
  Scroll, 
  Leaf, 
  Star, 
  Trophy, 
  Gem
} from "lucide-react";

export const FloatingOrnaments = ({ step }: { step: number }) => {
  const stepOrnaments = React.useMemo(() => [
    // Step 1: Tiger (Energy/Action) - Indigo/Orange
    [
      { icon: Zap, color: "text-orange-300", size: 32, top: "15%", left: "10%", delay: 0, duration: 5.2 },
      { icon: Shield, color: "text-indigo-200", size: 40, top: "25%", left: "85%", delay: 1, duration: 6.5 },
      { icon: Flame, color: "text-orange-400", size: 24, top: "75%", left: "15%", delay: 0.5, duration: 4.8 },
      { icon: Zap, color: "text-indigo-100", size: 36, top: "65%", left: "80%", delay: 1.5, duration: 7.1 },
    ],
    // Step 2: Komodo (Quest/Wealth) - Emerald
    [
      { icon: Coins, color: "text-emerald-200", size: 32, top: "12%", left: "15%", delay: 0, duration: 5.8 },
      { icon: Scroll, color: "text-emerald-100", size: 40, top: "22%", left: "82%", delay: 0.8, duration: 6.2 },
      { icon: Leaf, color: "text-emerald-300", size: 24, top: "78%", left: "12%", delay: 1.2, duration: 4.5 },
      { icon: Coins, color: "text-white", size: 36, top: "68%", left: "88%", delay: 0.4, duration: 7.4 },
    ],
    // Step 3: Rhino (Achievement/Power) - Amber
    [
      { icon: Star, color: "text-amber-200", size: 32, top: "18%", left: "12%", delay: 0, duration: 5.5 },
      { icon: Trophy, color: "text-amber-100", size: 40, top: "28%", left: "80%", delay: 0.6, duration: 6.8 },
      { icon: Gem, color: "text-amber-300", size: 24, top: "72%", left: "18%", delay: 1.4, duration: 4.2 },
      { icon: Star, color: "text-white", size: 36, top: "62%", left: "85%", delay: 0.2, duration: 7.7 },
    ]
  ], []);

  const particles = React.useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    top: `${(i * 13.7) % 100}%`,
    left: `${(i * 21.3) % 100}%`,
    duration: 4 + (i % 4),
    delay: i * 0.2
  })), []);

  const idx = (step - 1) % 3;
  const currentSet = stepOrnaments[idx] || stepOrnaments[0];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={`ornaments-${step}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full h-full"
        >
          {currentSet.map((orn, i) => (
            <motion.div
              key={i}
              className={`absolute ${orn.color} opacity-30 drop-shadow-lg`}
              style={{ top: orn.top, left: orn.left }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 15, -15, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: orn.duration,
                repeat: Infinity,
                delay: orn.delay,
                ease: "easeInOut",
              }}
            >
              <orn.icon size={orn.size} strokeWidth={1.2} />
            </motion.div>
          ))}
          
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-20"
              style={{ top: p.top, left: p.left }}
              animate={{
                y: [0, -60, 0],
                x: [0, 20, 0],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const BackgroundMesh = ({ step, variant }: { step?: number, variant?: 'indigo' | 'emerald' | 'amber' | 'rose' }) => {
  const gradients = {
    indigo: "from-indigo-600 via-indigo-700 to-indigo-900",
    emerald: "from-emerald-500 via-emerald-600 to-emerald-800",
    amber: "from-amber-400 via-amber-500 to-amber-700",
    rose: "from-rose-400 via-rose-500 to-rose-700",
  };

  let gradientClass = gradients.indigo;
  if (variant) {
    gradientClass = gradients[variant];
  } else if (step) {
    const gList = [gradients.indigo, gradients.emerald, gradients.amber];
    gradientClass = gList[(step - 1) % 3];
  }

  return (
    <div className={`absolute inset-0 bg-linear-to-br ${gradientClass} transition-colors duration-1000 -z-20`}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-50">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-white/20 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-white/20 rounded-full blur-[140px]" 
        />
      </div>
    </div>
  );
};
