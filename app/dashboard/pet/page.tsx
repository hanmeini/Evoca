"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Sparkles, 
  Heart,
  Zap,
  ArrowLeft,
  Activity,
  Trophy,
  Utensils,
  Gamepad2,
  Moon,
  Sun,
  Stars,
  Coffee
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn, getTodayStr } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { MASCOTS } from "@/src/components/home/onboarding/constants";
import { UNITS } from "@/src/constants/units";

// Particle component for interactions
const Particle = ({ x, y, icon: Icon, color }: { x: number, y: number, icon: any, color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x, y }}
    animate={{ 
      opacity: [0, 1, 0], 
      scale: [0, 1.5, 0.5],
      y: y - 100,
      x: x + (Math.random() - 0.5) * 50
    }}
    transition={{ duration: 1, ease: "easeOut" }}
    className={cn("absolute pointer-events-none z-50", color)}
  >
    <Icon className="w-6 h-6 fill-current" />
  </motion.div>
);

export default function PetPage() {
  const { userStats, user } = useAuth();
  const streak = userStats?.streak || 1;
  const gems = userStats?.gems || 0;
  const [xp, setXp] = useState(userStats?.totalXP || 0);
  const [userMascot, setUserMascot] = useState<string>("tiger");
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, icon: any, color: string }[]>([]);

  // Load selected mascot
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedMascot");
      if (saved) setUserMascot(saved);
    }
  }, []);

  const mascotData = useMemo(() => {
    const found = MASCOTS.find(m => m.id === userMascot);
    if (found) return found;
    
    // Fallback/Special case for Yeti
    if (userMascot === "yeti") {
      return {
        id: "yeti",
        name: "Yeti",
        image: UNITS[0].monsters[2].image, // Adult Yeti
        color: "text-indigo-600",
        bg: "bg-indigo-50"
      };
    }
    
    return MASCOTS[0]; // Default to Tiger
  }, [userMascot]);

  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<string | null>(null);

  const todayStr = getTodayStr();
  const isQuestCompletedToday = useMemo(() => {
    const d = userStats?.dailyProgress?.[todayStr] || {};
    return (d.documentsUploaded || 0) >= 1 || (d.messagesSent || 0) >= 5 || (d.quizzesPerfect || 0) >= 1 || (d.podcastsFinished || 0) >= 1;
  }, [userStats, todayStr]);

  const level = Math.floor(xp / 100) + 1;
  const progressToNextLevel = (xp % 100);

  const spawnParticles = (count: number, icon: any, color: string) => {
    const newParticles = Array.from({ length: count }).map(() => ({
      id: Math.random(),
      x: (Math.random() - 0.5) * 100,
      y: 0,
      icon,
      color
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const handleInteraction = (type: "pet" | "feed" | "play") => {
    if (isInteracting) return;
    setIsInteracting(true);
    setInteractionType(type);

    if (type === "pet") {
      spawnParticles(5, Heart, "text-rose-400");
    } else if (type === "feed") {
      spawnParticles(5, Coffee, "text-amber-600");
      setXp(prev => prev + 10);
    } else if (type === "play") {
      spawnParticles(5, Sparkles, "text-indigo-400");
      setXp(prev => prev + 5);
    }

    setTimeout(() => {
      setIsInteracting(false);
      setInteractionType(null);
    }, 1000);
  };

  return (
    <div className="bg-[#fffdfa] min-h-screen relative overflow-x-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
      />
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fffdfa]/80 backdrop-blur-xl border-b border-orange-100 lg:left-72">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-amber-900/40 hover:text-amber-900 transition-all font-black uppercase text-[10px] tracking-widest group">
            <div className="p-2 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Beranda</span>
          </Link>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-orange-100 shadow-sm">
                <Flame className={cn("w-4 h-4", isQuestCompletedToday ? "text-orange-500 fill-orange-500 animate-pulse" : "text-stone-300")} />
                <span className="font-black text-xs text-stone-700">{streak} Hari</span>
             </div>
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm">
                <span className="text-sm">💎</span>
                <span className="font-black text-xs text-indigo-500">{gems}</span>
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1240px] mx-auto px-4 pt-28 pb-32 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 relative z-10">
        <div className="flex flex-col items-center">
          {/* Main Pet Stage */}
          <div className="relative w-full aspect-square max-w-[480px] flex items-center justify-center">
            {/* Stage Decor */}
            <div className="absolute inset-0 bg-linear-to-b from-orange-100/30 to-rose-100/20 rounded-[4rem] border-2 border-orange-50/50 shadow-inner" />
            
            {/* Mascot Container */}
            <motion.div 
               animate={isInteracting ? { 
                 scale: [1, 1.1, 0.95, 1],
                 y: interactionType === "play" ? [0, -40, 0] : 0 
               } : { 
                 y: [0, -10, 0] 
               }}
               transition={{ 
                 duration: isInteracting ? 0.4 : 4, 
                 repeat: isInteracting ? 0 : Infinity,
                 ease: "easeInOut" 
               }}
               className="relative w-[70%] h-[70%] z-20"
            >
              <img
                src={mascotData.image}
                alt={mascotData.name}
                className={cn(
                  "w-full h-full object-contain drop-shadow-2xl transition-all duration-700",
                  !isQuestCompletedToday && "grayscale opacity-60 scale-95"
                )}
              />

              {/* Interaction Particles */}
              {particles.map(p => (
                <Particle key={p.id} x={p.x} y={p.y} icon={p.icon} color={p.color} />
              ))}

              {/* Floating Bubble */}
              <AnimatePresence>
                {isInteracting && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{ opacity: 1, scale: 1, y: -40 }}
                    exit={{ opacity: 0, scale: 0.5, y: -60 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-6 py-3 rounded-2xl shadow-xl font-black text-xs uppercase text-amber-600 border-2 border-amber-50"
                  >
                    {interactionType === "pet" ? "❤ Sayang!" : interactionType === "feed" ? "🍴 Nyam!" : "✨ Seru!"}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Platform Shadow */}
            <div className="absolute bottom-16 w-32 h-6 bg-stone-900/5 blur-xl rounded-full scale-125" />
          </div>

          {/* Info Section */}
          <div className="text-center mt-12 mb-12">
            <h1 className="text-5xl font-black text-amber-950 tracking-tighter uppercase mb-4 drop-shadow-sm">
              {mascotData.name}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="px-5 py-2 rounded-xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest shadow-[0_4px_0_0_#c2410c] border-b border-white/20">
                Peliharaan Utama
              </div>
              <div className="px-5 py-2 rounded-xl bg-amber-100 text-amber-700 font-black text-[10px] uppercase tracking-widest border border-amber-200 shadow-sm">
                Level {level}
              </div>
            </div>
          </div>

          {/* Interaction Grid */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-lg mb-16">
            {[
              { id: "pet", icon: Heart, label: "Sayang", sub: "Kasih Sayang", color: "bg-rose-500", shadow: "shadow-rose-200", hover: "hover:bg-rose-600" },
              { id: "feed", icon: Utensils, label: "Makan", sub: "+10 XP", color: "bg-amber-500", shadow: "shadow-amber-200", hover: "hover:bg-amber-600" },
              { id: "play", icon: Gamepad2, label: "Main", sub: "+5 XP", color: "bg-indigo-500", shadow: "shadow-indigo-200", hover: "hover:bg-indigo-600" },
            ].map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleInteraction(action.id as any)}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-[2.5rem] bg-white border-2 border-stone-100 shadow-xl transition-all group",
                  action.id === "pet" ? "hover:border-rose-100" : action.id === "feed" ? "hover:border-amber-100" : "hover:border-indigo-100"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2 transition-transform group-hover:rotate-6",
                  action.color
                )}>
                  <action.icon className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-stone-800 uppercase tracking-widest">{action.label}</p>
                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter mt-1">{action.sub}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Growth Card */}
          <div className="w-full max-w-sm bg-white border-2 border-orange-50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 text-amber-900/60 font-black text-[9px] uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5" />
                   Progress Pertumbuhan
                </div>
                <span>{xp} / {level * 100} XP</span>
              </div>
              
              <div className="h-6 bg-orange-50 rounded-full overflow-hidden p-1 shadow-inner border border-orange-100">
                <motion.div 
                  animate={{ width: `${progressToNextLevel}%` }}
                  className="h-full bg-linear-to-r from-orange-400 to-amber-500 rounded-full relative"
                >
                   <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                </motion.div>
              </div>

              <div className="mt-8 flex items-center justify-around">
                {[
                  { icon: Sun, label: "Energi", val: streak > 0 ? "100%" : "40%", color: "text-amber-500" },
                  { icon: Moon, label: "Tidur", val: "8/8h", color: "text-indigo-500" },
                  { icon: Heart, label: "Cinta", val: "Maks", color: "text-rose-500" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <s.icon className={cn("w-4 h-4", s.color)} />
                    <p className="text-[9px] font-black text-amber-950/40 uppercase tracking-widest">{s.label}</p>
                    <p className="text-xs font-black text-amber-950">{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-28 h-fit">
           {/* Achievement Widget */}
           <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Trophy className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest">Master Pet</h3>
                    <p className="text-[9px] font-bold opacity-60 uppercase">Unit 1: Selesai</p>
                  </div>
                </div>
                
                <p className="text-xs font-medium leading-relaxed opacity-90 mb-6 italic">
                  &quot;Peliharaanmu sangat bangga padamu! Terus belajar untuk membuka evolusi baru.&quot;
                </p>

                <div className="flex gap-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className={cn(
                       "w-8 h-8 rounded-lg flex items-center justify-center text-xs",
                       i === 1 ? "bg-amber-400" : "bg-white/10 opacity-30"
                     )}>
                        {i === 1 ? "🥇" : "🔒"}
                     </div>
                   ))}
                </div>
              </div>
           </div>

           {/* Vitality Bars */}
           <div className="bg-white border-2 border-orange-50 rounded-[3rem] p-8 shadow-xl">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-amber-900/40 mb-8">Statistik Vitalitas</h3>
              
              <div className="space-y-6">
                 {[
                   { label: "Kelaparan", val: 82, color: "bg-amber-400" },
                   { label: "Kebahagiaan", val: 95, color: "bg-rose-400" },
                   { label: "Kesehatan", val: 100, color: "bg-emerald-400" },
                 ].map((stat, i) => (
                   <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-stone-600 px-1">
                        <span>{stat.label}</span>
                        <span className="text-amber-600">{stat.val}%</span>
                     </div>
                     <div className="h-3 bg-orange-50 rounded-full border border-orange-100 p-0.5 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.val}%` }}
                          className={cn("h-full rounded-full transition-all duration-1000", stat.color)}
                        />
                     </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Tip Widget */}
           <div className="bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] p-8 text-amber-900/60">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                   <Stars className="w-4 h-4 text-amber-500" />
                 </div>
                 <p className="font-black text-[10px] uppercase tracking-widest">Tips Penjaga Pet</p>
              </div>
              <p className="text-xs font-bold leading-relaxed mb-6">
                Kasih makan dan main setiap hari supaya status vitalitas tetap 100% dan bonus XP berlipat ganda!
              </p>
              <button className="w-full py-4 bg-white text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-amber-100 shadow-sm border-b-4 hover:translate-y-0.5 transition-transform active:border-b-0">
                PANDUAN PERAWATAN
              </button>
           </div>
        </aside>
      </div>

      {/* Floating UI Elements */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1c1917]/95 backdrop-blur-xl px-8 py-5 rounded-[2.5rem] shadow-2xl border border-white/10 z-50">
        <div className="flex items-center gap-6 pr-6 border-r border-white/10">
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Daily Goal</span>
              <span className="text-xs font-black text-white">4/5 Misi</span>
           </div>
           <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
              <Zap className="w-5 h-5 fill-current" />
           </div>
        </div>
        <Link href="/dashboard" className="text-xs font-black text-white uppercase tracking-[0.2em] hover:text-orange-400 transition-colors">
          Buka Peta Jalan
        </Link>
      </div>
    </div>
  );
}

