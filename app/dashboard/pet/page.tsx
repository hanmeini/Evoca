"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Heart,
  Zap,
  Info,
  Egg,
  Bird,
  Dog,
  Cat,
  Target,
  ArrowLeft,
  Trophy,
  Ghost,
  History,
  TrendingUp,
  Activity
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export default function PetPage() {
  const [streak, setStreak] = useState(1);
  const [xp, setXp] = useState(750);
  const [level, setLevel] = useState(5);
  const [isInteracting, setIsInteracting] = useState(false);
  
  type InteractionType = "pet" | "feed" | "play";
  const [interactionType, setInteractionType] = useState<InteractionType | null>(null);

  // Constants
  const maxXp = 1000;
  const petName = "Aether";

  const evolutions = [
    { label: "Egg", streakCount: 0, icon: Egg, color: "text-stone-300", bg: "bg-stone-50", labelId: "Cosmic Egg" },
    { label: "Baby", streakCount: 3, icon: Bird, color: "text-yellow-400", bg: "bg-yellow-50", labelId: "Stellar Hatchling" },
    { label: "Junior", streakCount: 7, icon: Cat, color: "text-indigo-400", bg: "bg-indigo-50", labelId: "Astral Junior" },
    { label: "Senior", streakCount: 14, icon: Dog, color: "text-purple-500", bg: "bg-purple-50", labelId: "Nova Senior" },
    { label: "Mythic", streakCount: 30, icon: Sparkles, color: "text-rose-500", bg: "bg-rose-50", labelId: "Celestial Guardian" },
  ];

  const currentEvo = [...evolutions].reverse().find(e => streak >= e.streakCount) || evolutions[0];

  const handleInteraction = (type: InteractionType) => {
    if (isInteracting) return;
    setIsInteracting(true);
    setInteractionType(type);
    
    // Simulate growth/happiness
    if (type === "feed") setXp(prev => Math.min(prev + 20, maxXp));
    if (type === "play") setXp(prev => Math.min(prev + 10, maxXp));

    setTimeout(() => {
      setIsInteracting(false);
      setInteractionType(null);
    }, 2000);
  };

  return (
    <div className="bg-white min-h-screen relative overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 lg:left-72">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors font-black uppercase text-[10px] tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="font-black text-xs text-orange-500">{streak} Hari</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-sm">💎</span>
                <span className="font-black text-xs text-indigo-500">505</span>
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1240px] mx-auto px-4 pt-24 pb-32 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        {/* Main Content Area */}
        <div className="flex flex-col items-center">
          {/* Mascot Section */}
          <div className="relative w-full aspect-square max-w-[420px] flex items-center justify-center bg-stone-50/50 rounded-[4rem] border border-stone-100">
              <motion.div 
                 animate={isInteracting ? { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] } : { y: [0, -10, 0] }}
                 whileTap={{ scale: 0.95 }}
                 transition={{ duration: isInteracting ? 0.3 : 3, repeat: Infinity, ease: "easeInOut" }}
                 onClick={() => handleInteraction("pet")}
                 className="relative w-full h-full cursor-pointer"
              >
                <video
                  src="/animations/mascot-yeti.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
                
                {/* Interaction feedback */}
                <AnimatePresence>
                  {isInteracting && (
                     <motion.div 
                       initial={{ opacity: 0, y: 20, scale: 0.5 }}
                       animate={{ opacity: 1, y: -40, scale: 1 }}
                       exit={{ opacity: 0, y: -80, scale: 0.5 }}
                       className="absolute top-0 right-1/4 bg-white px-4 py-2 rounded-2xl shadow-xl font-black text-xs uppercase text-rose-500 border-2 border-rose-50"
                     >
                       {interactionType === "pet" ? "❤ Sayang!" : interactionType === "feed" ? "🍴 Nyam!" : "✨ Seru!"}
                     </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
          </div>

          {/* Pet Title & Info */}
          <div className="text-center mt-8">
             <h1 className="text-5xl font-black text-stone-900 tracking-tighter uppercase">{petName}</h1>
             <div className="flex items-center justify-center gap-3 mt-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${currentEvo.bg} ${currentEvo.color} border border-current/10 border-b-4`}>
                  {currentEvo.labelId}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-stone-100 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] border border-stone-200 border-b-4">
                  Level {level}
                </span>
             </div>
          </div>

          {/* Dotted Streak Progress Bar */}
          <div className="w-full max-w-sm mt-12 bg-stone-50 border-2 border-stone-100 rounded-[3rem] p-10 shadow-sm relative">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-stone-400 font-sans">Streak Milestone</h3>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-stone-100">
                   <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                   <span className="font-black text-xs text-stone-900">{streak} / 7</span>
                </div>
             </div>
             
             <div className="flex justify-between items-center px-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                     <motion.div 
                       initial={false}
                       animate={{ 
                          scale: streak > i ? 1.1 : 0.9,
                          backgroundColor: streak > i ? "#ff9600" : "#ffffff" 
                       }}
                       className={cn(
                          "w-5 h-5 rounded-full border-2 transition-all",
                          streak > i ? "border-orange-400 shadow-[0_0_15px_rgba(255,150,0,0.4)]" : "border-stone-200"
                       )}
                     />
                     <span className="text-[9px] font-black text-stone-300 uppercase tracking-tighter">{["S", "S", "R", "K", "J", "S", "M"][i]}</span>
                  </div>
                ))}
             </div>
             
             <div className="mt-10 pt-10 border-t border-stone-200/50">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Growth Progress</span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase">{xp} / {maxXp} XP</span>
                </div>
                <div className="h-5 bg-white rounded-full overflow-hidden p-1 shadow-inner border border-stone-100">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(xp/maxXp)*100}%` }}
                     className="h-full bg-linear-to-r from-indigo-500 to-indigo-400 rounded-full relative"
                   >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                   </motion.div>
                </div>
             </div>
          </div>

          {/* Interaction Actions */}
          <div className="flex items-center gap-6 mt-12 mb-20">
             {( [
               { id: "pet", icon: Heart, label: "Sayang", color: "hover:bg-rose-50 hover:text-rose-500 border-stone-100 hover:border-rose-100 shadow-sm" },
               { id: "feed", icon: Zap, label: "Makan", color: "hover:bg-amber-50 hover:text-amber-500 border-stone-100 hover:border-amber-100 shadow-sm" },
               { id: "play", icon: Ghost, label: "Main", color: "hover:bg-indigo-50 hover:text-indigo-500 border-stone-100 hover:border-indigo-100 shadow-sm" },
             ] as const).map((action) => (
               <motion.button
                 key={action.id}
                 whileHover={{ y: -6, scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => handleInteraction(action.id)}
                 className={cn(
                    "flex flex-col items-center gap-3 p-6 bg-white border-2 rounded-[2.5rem] transition-all duration-300 w-32",
                    action.color
                 )}
               >
                 <action.icon className="w-6 h-6" />
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">{action.label}</span>
               </motion.button>
             ))}
          </div>

          {/* Evolution Preview Section */}
          <div className="w-full mt-10">
              <h2 className="text-center font-black text-[11px] uppercase tracking-[0.4em] text-stone-400 mb-12 flex items-center justify-center gap-6">
                <span className="h-[1px] w-12 bg-stone-100" />
                Preview Evolusi
                <span className="h-[1px] w-12 bg-stone-100" />
              </h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                 {evolutions.map((evo, i) => {
                   const isReached = streak >= evo.streakCount;
                   const EvoIcon = evo.icon;
                   
                   return (
                     <div key={i} className={cn(
                        "flex flex-col items-center gap-5 p-7 rounded-[3rem] border-2 transition-all relative group",
                        isReached ? "bg-white border-indigo-500 shadow-xl scale-105" : "bg-stone-50 border-stone-100 opacity-40"
                     )}>
                        {isReached && (
                           <div className="absolute -top-3 -right-3 w-9 h-9 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                              <Sparkles className="w-4 h-4" />
                           </div>
                        )}
                        
                        <div className={cn(
                           "w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-transform group-hover:rotate-6",
                           isReached ? "bg-indigo-50 border-indigo-100 text-indigo-500" : "bg-stone-200 border-stone-300 text-stone-400"
                        )}>
                          <EvoIcon className="w-10 h-10" />
                        </div>
                        
                        <div className="text-center">
                           <p className={cn("font-black text-[11px] uppercase tracking-tighter mb-1", isReached ? "text-indigo-600" : "text-stone-400")}>
                             {evo.label}
                           </p>
                           <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{evo.streakCount} Hari</p>
                        </div>
                        
                        {i < evolutions.length - 1 && (
                           <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-stone-100" />
                        )}
                     </div>
                   )
                 })}
              </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
           {/* Pet Vitality Widget */}
           <div className="bg-white border-2 border-stone-100 rounded-[3rem] p-8 shadow-sm">
              <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-stone-900 mb-8 flex items-center gap-3">
                 <Activity className="w-4 h-4 text-rose-500" />
                 Vitalitas {petName}
              </h3>
              
              <div className="space-y-6">
                 {[
                   { label: "Kelaparan", val: 85, color: "bg-amber-400" },
                   { label: "Kebahagiaan", val: 92, color: "bg-rose-400" },
                   { label: "Energi", val: 64, color: "bg-indigo-400" },
                 ].map((stat, i) => (
                   <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-stone-400">
                        <span>{stat.label}</span>
                        <span className="text-stone-900">{stat.val}%</span>
                     </div>
                     <div className="h-2.5 bg-stone-50 rounded-full border border-stone-100 p-[2px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.val}%` }}
                          className={cn("h-full rounded-full", stat.color)}
                        />
                     </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Evolution Log Widget */}
           <div className="bg-stone-900 rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                   <History className="w-4 h-4 text-indigo-400" />
                   Catatan Evolusi
                </h3>
                
                <div className="space-y-6">
                   {[
                     { date: "11 Maret", event: "Telur Kosmik Mendekat", active: true },
                     { date: "Akan Datang", event: "Evolusi Stellar Hatchling", active: false },
                   ].map((log, i) => (
                     <div key={i} className="flex gap-4">
                        <div className={cn("w-2 h-2 rounded-full mt-1 shrink-0", log.active ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" : "bg-stone-700")} />
                        <div>
                           <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-0.5">{log.date}</p>
                           <p className={cn("text-xs font-bold", log.active ? "text-white" : "text-stone-500")}>{log.event}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
           </div>

           {/* Power Rank Widget */}
           <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-indigo-900">Power Rank</h3>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              
              <div className="flex items-end gap-3 mb-6">
                 <span className="text-4xl font-black text-indigo-600 tracking-tighter">#42</span>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pb-1.5">Global</span>
              </div>
              
              <p className="text-[10px] font-black text-indigo-900/40 uppercase tracking-tight leading-relaxed italic">
                 "Dibutuhkan 50 XP lagi untuk naik ke peringkat #40"
              </p>

              <button className="w-full mt-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-200 shadow-sm border-b-4 hover:translate-y-0.5 transition-transform active:border-b-0">
                 LIHAT PAPAN SKOR
              </button>
           </div>
        </aside>
      </div>

      {/* Persistent Bottom CTA Overlay for Mobile */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
         <Link href="/dashboard" className="flex items-center justify-center gap-3 w-full py-5 bg-[#1c1917] text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl">
            <Target className="w-5 h-5" />
            MULAI BELAJAR
         </Link>
      </div>
    </div>
  );
}
