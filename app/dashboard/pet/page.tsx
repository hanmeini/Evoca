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
  Lock,
  CheckCircle2,
  ShoppingBag,
  Book
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { cn, getTodayStr } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { MASCOTS } from "@/src/components/home/onboarding/constants";

// Particle component for interactions
const Particle = ({ x, y, icon: Icon, color, xOffset }: { x: number, y: number, icon: any, color: string, xOffset: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x, y }}
    animate={{ 
      opacity: [0, 1, 0], 
      scale: [0, 1.5, 0.5],
      y: y - 100,
      x: x + xOffset
    }}
    transition={{ duration: 1, ease: "easeOut" }}
    className={cn("absolute pointer-events-none z-50", color)}
  >
    <Icon className="w-6 h-6 fill-current" />
  </motion.div>
);

// Mascot Renderer Component (Image-only Evolution)
const MascotRenderer = ({ mascotId, stage, isInteracting, interactionType }: { 
  mascotId: string, 
  stage: string, 
  isInteracting: boolean,
  interactionType: string | null
}) => {
  const [hasError, setHasError] = useState(false);
  const [retryWithJpg, setRetryWithJpg] = useState(false);

  // Use a key to force component reset and avoid cascading renders
  // when pet or stage changes.
  const pngPath = `/pet/${mascotId}/${stage}.png`;
  const jpgPath = `/pet/${mascotId}/${stage}.jpg`;
  const fallbackImage = `/pet/${mascotId}/image.png`;

  const currentSrc = hasError ? fallbackImage : (retryWithJpg ? jpgPath : pngPath);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        key={`${mascotId}-${stage}-${retryWithJpg}-${hasError}`}
        src={currentSrc}
        alt={`${mascotId} ${stage}`}
        onError={() => {
          if (!retryWithJpg && !hasError) {
            setRetryWithJpg(true);
          } else {
            setHasError(true);
          }
        }}
        className={cn(
          "w-full h-full object-contain transition-all duration-700",
          isInteracting && interactionType === "play" && "scale-110 -translate-y-4"
        )}
      />
    </div>
  );
};

export default function PetPage() {
  const { userStats, updateUserStats } = useAuth();
  const streak = userStats?.streak || 1;
  const gems = userStats?.gems || 0;
  const selectedMascot = userStats?.selectedMascot || "tiger";
  const ownedMascots = userStats?.ownedMascots || ["tiger"];
  const petLevels = userStats?.petLevels || { tiger: 1 };
  
  const currentLevel = petLevels[selectedMascot] || 1;
  
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, xOffset: number, icon: any, color: string }[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<string | null>(null);
   const [showGuide, setShowGuide] = useState(false);
   const [showLowGems, setShowLowGems] = useState(false);

   const todayStr = getTodayStr();
   const petFood = userStats?.petFood || 0;
   const petPlay = userStats?.petPlay || 0;

  const isQuestCompletedToday = useMemo(() => {
    const d = userStats?.dailyProgress?.[todayStr] || {};
    return (d.documentsUploaded || 0) >= 1 || (d.messagesSent || 0) >= 5 || (d.quizzesPerfect || 0) >= 1 || (d.podcastsFinished || 0) >= 1;
  }, [userStats, todayStr]);

  const isAlreadyClaimed = userStats?.claimedDailyXP?.[todayStr] || false;

  const claimDailyXP = async () => {
    if (isAlreadyClaimed) return;
    
     const xpGain = 50;
     const petXP = userStats?.petXP || {};
     const currentPetXP = petXP[selectedMascot] || 0;
     const newPetXP = currentPetXP + xpGain;
     const newLevel = Math.floor(newPetXP / 100) + 1;
     
     const newPetLevels = { ...petLevels, [selectedMascot]: newLevel };
     const newPetXPMap = { ...petXP, [selectedMascot]: newPetXP };

     const newClaimed = { ...(userStats?.claimedDailyXP || {}), [todayStr]: true };

     await updateUserStats({
       petXP: newPetXPMap,
       petLevels: newPetLevels,
       totalXP: (userStats?.totalXP || 0) + xpGain,
       claimedDailyXP: newClaimed
     });
    
    spawnParticles(10, Zap, "text-amber-400");
  };

  // Determine stage based on level
  const stage = currentLevel < 10 ? "young" : currentLevel < 20 ? "teen" : "adult";
  
  const mascotData = useMemo(() => {
    return MASCOTS.find(m => m.id === selectedMascot) || {
      id: "tiger",
      name: "Tiger Ninja",
    };
  }, [selectedMascot]);

   const currentPetXP = (userStats?.petXP || {})[selectedMascot] || 0;
   const progressToNextLevel = (currentPetXP % 100);

  const spawnParticles = (count: number, icon: any, color: string) => {
    const newParticles = Array.from({ length: count }).map(() => ({
      id: Math.random(),
      x: (Math.random() - 0.5) * 100,
      y: 0,
      xOffset: (Math.random() - 0.5) * 50,
      icon,
      color
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

   const handleInteraction = async (type: "pet" | "feed" | "play") => {
     if (isInteracting) return;
     setIsInteracting(true);
     setInteractionType(type);

     const petXPMap = userStats?.petXP || {};
     const currentPetXP = petXPMap[selectedMascot] || 0;

     let xpGain = 0;
     let gemCost = 0;
     let stockUpdate: any = {};

     if (type === "pet") {
       spawnParticles(5, Heart, "text-rose-400");
       xpGain = 2;
     } else if (type === "feed") {
        if (petFood > 0) {
          stockUpdate = { petFood: petFood - 1 };
        } else {
          gemCost = 15;
        }
        if (gems >= gemCost) {
          spawnParticles(5, Zap, "text-amber-600");
          xpGain = 15;
        } else {
          setIsInteracting(false);
          setInteractionType(null);
          setShowLowGems(true);
          return;
        }
     } else if (type === "play") {
        if (petPlay > 0) {
          stockUpdate = { petPlay: petPlay - 1 };
        } else {
          gemCost = 10;
        }
        if (gems >= gemCost) {
          spawnParticles(5, Sparkles, "text-indigo-400");
          xpGain = 10;
        } else {
          setIsInteracting(false);
          setInteractionType(null);
          setShowLowGems(true);
          return;
        }
     }

     const newPetXP = currentPetXP + xpGain;
     const newLevel = Math.floor(newPetXP / 100) + 1;
     
     const newPetLevels = { ...petLevels, [selectedMascot]: newLevel };
     const newPetXPMap = { ...petXPMap, [selectedMascot]: newPetXP };

     const updates: any = {
       petXP: newPetXPMap,
       petLevels: newPetLevels,
       totalXP: (userStats?.totalXP || 0) + xpGain,
       ...stockUpdate
     };
     if (gemCost > 0) updates.gems = gems - gemCost;

     await updateUserStats(updates);

     setTimeout(() => {
       setIsInteracting(false);
       setInteractionType(null);
     }, 1000);
   };

   const buyPet = async (petId: string, price: number) => {
     if (gems < price) return setShowLowGems(true);
     if (ownedMascots.includes(petId)) return;

     const newOwned = [...ownedMascots, petId];
     const newPetLevels = { ...petLevels, [petId]: 1 };
     const newPetXPMap = { ...(userStats?.petXP || {}), [petId]: 0 };

     await updateUserStats({
       gems: gems - price,
       ownedMascots: newOwned,
       petLevels: newPetLevels,
       petXP: newPetXPMap,
       selectedMascot: petId
     });
     if (typeof window !== "undefined") {
       localStorage.setItem("selectedMascot", petId);
     }
   };

  const selectPet = async (petId: string) => {
    if (!ownedMascots.includes(petId)) return;
    await updateUserStats({ selectedMascot: petId });
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedMascot", petId);
    }
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen relative overflow-x-hidden font-sans pb-20">
      {/* Duolingo Style Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-stone-200 lg:left-72">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-all font-black uppercase text-xs tracking-widest group">
              <div className="p-2 rounded-xl bg-stone-100 group-hover:bg-stone-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Beranda</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-stone-100">
                <Flame className={cn("w-5 h-5", streak > 0 ? "text-[#ff9600] fill-[#ff9600]" : "text-stone-200")} />
                <span className="font-black text-sm text-stone-600">{streak}</span>
             </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-stone-100 bg-amber-50/30">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fcd34d" viewBox="0 0 256 256" className="w-5 h-5 drop-shadow-sm"><path d="M249,96.1l-56-64a12,12,0,0,0-9-4.1H72a12,12,0,0,0-9,4.1L7,96.1a12,12,0,0,0,.26,16.09l112,120a12,12,0,0,0,17.54,0l112-120A12,12,0,0,0,249,96.1ZM213.55,92H182L152,52h26.55ZM71.88,116l21.19,53L43.61,116Zm86.4,0L128,191.69,97.72,116ZM104,92l24-32,24,32Zm80.12,24h28.27l-49.46,53ZM77.45,52H104L74,92H42.45Z"></path></svg>
                 <span className="font-black text-sm text-[#ffc800]">{gems}</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-stone-100 bg-rose-50/30">
                  <Utensils className="w-4 h-4 text-rose-600" />
                  <span className="font-black text-sm text-rose-600">{petFood}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-stone-100 bg-indigo-50/30">
                  <Gamepad2 className="w-4 h-4 text-indigo-600" />
                  <span className="font-black text-sm text-indigo-600">{petPlay}</span>
                </div>
              </div>
           </div>
        </div>
      </header>

      {/* Premium Guidebook Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuide(false)}
              className="absolute inset-0 bg-[#8b5cf6]/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(139,92,246,0.3)] overflow-hidden border border-white/20"
            >
              {/* Mascot Peeking Header */}
              <div className="bg-linear-to-br from-[#8b5cf6] to-[#6d28d9] p-10 pb-12 text-white relative overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                   <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent)]" />
                   <Sparkles className="absolute top-10 right-10 w-24 h-24 rotate-12" />
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-inner text-white">
                    <Book className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-black uppercase tracking-tight leading-none mb-2 text-white">Panduan Pet</h2>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Partner Belajar Terbaikmu</p>
                  </div>
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all active:scale-90 text-white"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-90" />
                  </button>
                </div>
              </div>
              
              <div className="p-10 -mt-6 bg-white rounded-t-[2.5rem] relative z-20 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="group flex gap-5 p-5 rounded-[2rem] border-2 border-stone-100 hover:border-[#8b5cf6]/30 hover:bg-violet-50/30 transition-all duration-300">
                    <div className="w-14 h-14 shrink-0 bg-linear-to-br from-[#a78bfa] to-[#8b5cf6] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-100 group-hover:rotate-6 transition-transform">
                      <Trophy className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-[13px] uppercase mb-1.5 text-stone-800 tracking-tight">Evolusi Belajar</h3>
                      <p className="text-[11px] text-stone-500 font-bold leading-relaxed">
                        Selesaikan misi harian di Roadmap. Pet akan tumbuh setiap naik 10 level dari XP yang kamu kumpulkan!
                      </p>
                    </div>
                  </div>

                  <div className="group flex gap-5 p-5 rounded-[2rem] border-2 border-stone-100 hover:border-[#8b5cf6]/30 hover:bg-violet-50/30 transition-all duration-300">
                    <div className="w-14 h-14 shrink-0 bg-linear-to-br from-[#c084fc] to-[#a855f7] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-100 group-hover:rotate-6 transition-transform">
                      <Heart className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-[13px] uppercase mb-1.5 text-stone-800 tracking-tight">Kasih Sayang</h3>
                      <p className="text-[11px] text-stone-500 font-bold leading-relaxed">
                        Beri makan dan ajak main agar Pet makin pintar. Pet yang disayang akan membantumu lebih fokus!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="w-full py-5 bg-linear-to-br from-[#8b5cf6] to-[#7c3aed] border-b-4 border-[#6d28d9] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest active:border-b-0 active:translate-y-1 transition-all shadow-xl shadow-indigo-100"
                  >
                    MENGERTI!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
         )}
       </AnimatePresence>
 
       {/* Low Gems Popup */}
       <AnimatePresence>
         {showLowGems && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowLowGems(false)}
               className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, y: 40, rotate: -2 }}
               animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 40, rotate: 2 }}
               transition={{ type: "spring", damping: 15, stiffness: 100 }}
               className="relative w-full max-w-sm bg-white rounded-[3rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.4)] border border-white/20"
             >
                {/* Decorative Header */}
                <div className="h-32 bg-linear-to-br from-indigo-500 to-violet-600 relative overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                   <motion.div 
                     animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} 
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30"
                   >
                      <span className="text-4xl filter drop-shadow-md">😢</span>
                   </motion.div>
                </div>
                
                <div className="p-8 pt-6 text-center">
                   <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tight mb-3">Permata Tidak Mencukupi</h3>
                   <p className="text-stone-500 font-bold text-sm leading-relaxed mb-8 px-2">
                     Anda memerlukan lebih banyak permata untuk melakukan aksi ini. Selesaikan misi harian atau tantangan untuk mendapatkan lebih banyak hadiah!
                   </p>
                   
                   <div className="space-y-3">
                      <Link 
                        href="/dashboard/missions"
                        className="flex items-center justify-center gap-3 w-full py-4.5 bg-indigo-600 border-b-4 border-indigo-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-95 active:border-b-0 active:translate-y-1 shadow-lg shadow-indigo-200"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        KE MISI HARIAN
                      </Link>
                      
                      <button 
                        onClick={() => setShowLowGems(false)}
                        className="w-full py-4 text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-stone-600 transition-colors"
                      >
                         NANTI SAJA
                      </button>
                   </div>
                </div>

                {/* Floating Gem Ornaments */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
             </motion.div>
           </div>
         )}
       </AnimatePresence>

      <div className="max-w-[1240px] mx-auto px-4 pt-28 pb-32 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 relative z-10">
        <div className="flex flex-col items-center">
          {/* Claim Reward Banner Removed */}

          <div className="relative w-full aspect-square max-w-[480px] flex items-center justify-center p-8 bg-white rounded-4xl border-2 border-stone-200">
            <motion.div 
               animate={isInteracting ? { 
                 scale: [1, 1.1, 0.95, 1],
                 y: interactionType === "play" ? [0, -40, 0] : 0 
               } : { 
                 y: [0, -5, 0] 
               }}
               transition={{ 
                 duration: isInteracting ? 0.4 : 3, 
                 repeat: isInteracting ? 0 : Infinity,
                 ease: "easeInOut" 
               }}
               className="relative w-[75%] h-[75%] z-20 flex items-center justify-center"
            >
              <MascotRenderer 
                mascotId={selectedMascot} 
                stage={stage} 
                isInteracting={isInteracting} 
                interactionType={interactionType} 
              />

              {particles.map(p => (
                <Particle key={p.id} x={p.x} y={p.y} xOffset={p.xOffset} icon={p.icon} color={p.color} />
              ))}

              <AnimatePresence>
                {isInteracting && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{ opacity: 1, scale: 1, y: -40 }}
                    exit={{ opacity: 0, scale: 0.5, y: -60 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-4 py-2 rounded-xl border-2 border-stone-100 shadow-xl font-black text-xs uppercase text-[#58cc02]"
                  >
                    {interactionType === "pet" ? "❤ Love!" : interactionType === "feed" ? "🍴 Nyam!" : "✨ Fun!"}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="text-center mt-8 mb-10">
            <h1 className="text-4xl font-black text-stone-800 tracking-tight uppercase mb-2">
              {mascotData.name}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                Lvl {currentLevel} • {stage.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-12">
             {[
                { id: "pet", icon: Heart, label: "Sayang", color: "bg-[#ff4b4b]", border: "border-[#d33131]", cost: "Gratis", stock: null },
                { id: "feed", icon: Utensils, label: "Makan", color: "bg-[#ff9600]", border: "border-[#cc7a00]", cost: "15", stock: petFood, rewardIcon: Utensils },
                { id: "play", icon: Gamepad2, label: "Main", color: "bg-[#1cb0f6]", border: "border-[#1899d6]", cost: "10", stock: petPlay, rewardIcon: Gamepad2 },
              ].map((action) => {
                const hasStock = action.stock !== null && action.stock > 0;
                
                return (
                  <div key={action.id} className="relative group/btn">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInteraction(action.id as any)}
                      className={cn(
                        "w-full flex flex-col items-center gap-2 py-4 rounded-3xl text-white font-black text-xs uppercase tracking-widest transition-all",
                        action.color, "border-b-4", action.border,
                        "active:border-b-0 active:translate-y-1"
                      )}
                    >
                      <action.icon className="w-5 h-5 mb-1" />
                      {action.label}
                      <div className="mt-1 px-3 py-1 bg-black/10 rounded-full text-[9px] font-black border border-white/10 flex items-center gap-1">
                         {hasStock ? (
                           <>
                             {action.rewardIcon && <action.rewardIcon className="w-3 h-3" />}
                             <span>{action.stock}</span>
                           </>
                         ) : (
                           <>
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-amber-300"><path d="M249,96.1l-56-64a12,12,0,0,0-9-4.1H72a12,12,0,0,0-9,4.1L7,96.1a12,12,0,0,0,.26,16.09l112,120a12,12,0,0,0,17.54,0l112-120A12,12,0,0,0,249,96.1ZM213.55,92H182L152,52h26.55ZM71.88,116l21.19,53L43.61,116Zm86.4,0L128,191.69,97.72,116ZM104,92l24-32,24,32Zm80.12,24h28.27l-49.46,53ZM77.45,52H104L74,92H42.45Z"></path></svg>
                             <span>{action.cost}</span>
                           </>
                         )}
                      </div>
                    </motion.button>
                  </div>
                );
              })}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-white rounded-[2rem] border-2 border-stone-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-sm uppercase tracking-tight text-stone-800">Pet Vitality</h3>
              <Activity className="w-4 h-4 text-[#58cc02]" />
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase text-stone-400">
                   <span>XP Pertumbuhan</span>
                   <span>{progressToNextLevel}/100</span>
                 </div>
                 <div className="h-4 bg-stone-100 rounded-full border-2 border-stone-200 overflow-hidden p-0.5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progressToNextLevel}%` }}
                     className="h-full bg-[#58cc02] rounded-full"
                   />
                 </div>
              </div>
              
              <div className="pt-4 border-t-2 border-stone-50 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Status Mood</span>
                    <span className="text-[10px] font-black text-[#58cc02] uppercase tracking-widest">Sangat Ceria</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Suka Makan</span>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Buah-buahan</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-stone-200 p-8 shadow-sm">
            <h3 className="font-black text-sm uppercase tracking-tight text-stone-800 mb-6">Tahap Evolusi</h3>
            <div className="space-y-4">
              {[
                { s: "young", l: "1-9", label: "Young" },
                { s: "teen", l: "10-19", label: "Teen" },
                { s: "adult", l: "20+", label: "Adult" },
              ].map((step) => (
                <div key={step.s} className={cn(
                  "flex items-center gap-4 p-3 rounded-xl border-2 transition-all",
                  stage === step.s ? "bg-stone-50 border-stone-200" : "opacity-30 border-transparent grayscale"
                )}>
                  <div className={cn("w-2 h-2 rounded-full", stage === step.s ? "bg-[#58cc02]" : "bg-stone-300")} />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-tight">{step.label}</p>
                    <p className="text-[9px] font-bold text-stone-400 uppercase">Lv. {step.l}</p>
                  </div>
                  {stage === step.s && <CheckCircle2 className="w-4 h-4 text-[#58cc02]" />}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 mt-8 pb-32">
        <h2 className="text-2xl font-black text-stone-800 uppercase tracking-tight mb-8 px-4 flex items-center gap-4">
          <ShoppingBag className="w-6 h-6 text-indigo-500" />
          Pasar & Koleksi Pet
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {MASCOTS.map((pet) => {
            const isOwned = ownedMascots.includes(pet.id);
            const isSelected = selectedMascot === pet.id;
            
            return (
              <motion.div
                key={pet.id}
                whileHover={!isSelected ? { y: -5 } : {}}
                onClick={() => isOwned ? selectPet(pet.id) : buyPet(pet.id, pet.price || 0)}
                className={cn(
                  "p-4 rounded-3xl border-2 transition-all cursor-pointer bg-white relative",
                  isSelected ? "border-[#58cc02] bg-[#f7fff0]" : isOwned ? "border-stone-200 hover:border-stone-400" : "border-stone-100 opacity-60"
                )}
              >
                <div className="aspect-square w-full mb-3 flex items-center justify-center p-2">
                  <img 
                    src={`/pet/${pet.id}/young.png`} 
                    alt={pet.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `/pet/${pet.id}/image.png`;
                    }}
                    className={cn("w-full h-full object-contain", !isOwned && "grayscale opacity-40")}
                  />
                  {!isOwned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-stone-400 opacity-50" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h4 className="font-black text-xs uppercase tracking-tight text-stone-700 mb-1">{pet.name}</h4>
                  {isSelected ? (
                     <div className="text-[8px] font-black text-[#58cc02] uppercase tracking-widest">Aktif</div>
                  ) : isOwned ? (
                     <div className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Miliki</div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fcd34d" viewBox="0 0 256 256" className="w-3.5 h-3.5"><path d="M249,96.1l-56-64a12,12,0,0,0-9-4.1H72a12,12,0,0,0-9,4.1L7,96.1a12,12,0,0,0,.26,16.09l112,120a12,12,0,0,0,17.54,0l112-120A12,12,0,0,0,249,96.1ZM213.55,92H182L152,52h26.55ZM71.88,116l21.19,53L43.61,116Zm86.4,0L128,191.69,97.72,116ZM104,92l24-32,24,32Zm80.12,24h28.27l-49.46,53ZM77.45,52H104L74,92H42.45Z"></path></svg>
                      <span className="font-black text-xs text-amber-600">{pet.price}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Duolingo Style Floating Guidebook Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowGuide(true)}
        className="fixed bottom-8 right-8 z-60 flex items-center gap-3 px-6 py-4 bg-white border-2 border-stone-200 text-stone-700 rounded-2xl shadow-xl group hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all"
      >
        <Book className="w-6 h-6" />
        <span className="font-black text-xs uppercase tracking-widest">Panduan</span>
      </motion.button>
    </div>
  );
}
