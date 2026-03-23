"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Diamond, 
  Flame, 
  CheckCircle2, 
  Star, 
  ChevronRight,
  Sparkles,
  Zap,
  BookOpen,
  MessageCircle,
  Trophy,
  Timer,
  LucideIcon
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { cn, getTodayStr } from "@/src/lib/utils";
import { CountingNumber } from "@/src/components/ui/CountingNumber";

interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  reward: number;
  goal: number;
  current: number;
  category: "daily" | "achievement";
}

export default function MissionsPage() {
  const { user, userStats, refreshStats } = useAuth();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<{show: boolean, amount: number}>({ show: false, amount: 0 });
  const [activeTab, setActiveTab] = useState<"daily" | "achievement">("daily");

  const todayStr = getTodayStr();

  // Mission Templates
  const currentMissions = useMemo(() => {
    const d = userStats?.dailyProgress?.[todayStr] || {};

    const templates: MissionTemplate[] = [
      {
        id: "daily-visit",
        title: "Absensi Petualang",
        description: "Cukup buka Evoca hari ini untuk klaim hadiahmu!",
        icon: Flame,
        reward: 10,
        goal: 1,
        current: 1, // Always 1 if you are on the page
        category: "daily",
      },
      {
        id: "m1",
        title: "Pustakawan Cilik",
        description: "Unggah 1 dokumen baru untuk dipelajari hari ini.",
        icon: BookOpen,
        reward: 50,
        goal: 1,
        current: d.documentsUploaded || 0,
        category: "daily",
      },
      {
        id: "m2",
        title: "Si Paling Nanya",
        description: "Kirim 5 pesan di sesi Chat AI.",
        icon: MessageCircle,
        reward: 30,
        goal: 5,
        current: d.messagesSent || 0,
        category: "daily",
      },
      {
        id: "m4",
        title: "Pendengar Setia",
        description: "Selesaikan 1 sesi Podcast AI sampai akhir.",
        icon: Zap,
        reward: 40,
        goal: 1,
        current: d.podcastsFinished || 0,
        category: "daily",
      },
      {
        id: "achievement-quiz-perfect",
        title: "Pejuang Kuis",
        description: "Selesaikan kuis dengan nilai sempurna.",
        icon: Trophy,
        reward: 100,
        goal: 3,
        current: d.quizzesPerfect || 0,
        category: "daily",
      },
      {
        id: "a-bronze-coll",
        title: "Kolektor Perunggu",
        description: "Unggah total 5 dokumen ke perpustakaanmu.",
        icon: BookOpen,
        reward: 100,
        goal: 5,
        current: 3, // Global achievement, might need different tracking but leaving for now
        category: "achievement",
      },
      // ... (Achievements can be handled similarly but user requested daily "misi harian" specifically)
    ];

    // Preserve other achievement templates if needed, but primary focus is daily
    // Let's just update the daily ones and keep achievement logic as is for now
    // Actually I'll just rewrite the whole array for completeness based on the first view
    
    // RE-FETCHING ALL TEMPLATES TO ENSURE ACCURACY
    const fullTemplates: MissionTemplate[] = [
      { id: "daily-visit", title: "Absensi Petualang", description: "Cukup buka Evoca hari ini untuk klaim hadiahmu!", icon: Flame, reward: 10, goal: 1, current: 1, category: "daily" },
      { id: "m1", title: "Pustakawan Cilik", description: "Unggah 1 dokumen baru untuk dipelajari!", icon: BookOpen, reward: 50, goal: 1, current: d.documentsUploaded || 0, category: "daily" },
      { id: "m2", title: "Si Paling Nanya", description: "Kirim 5 pesan di sesi Chat AI.", icon: MessageCircle, reward: 30, goal: 5, current: d.messagesSent || 0, category: "daily" },
      { id: "m4", title: "Pendengar Setia", description: "Selesaikan 1 sesi Podcast AI sampai akhir.", icon: Zap, reward: 40, goal: 1, current: d.podcastsFinished || 0, category: "daily" },
      { id: "m3", title: "Pejuang Kuis", description: "Selesaikan kuis dengan nilai sempurna.", icon: Trophy, reward: 60, goal: 1, current: d.quizzesPerfect || 0, category: "daily" },
      
      { id: "a-exemplary", title: "Pelajar Teladan", description: "Kumpulkan total 1.000 XP dari belajar.", icon: Target, reward: 200, goal: 1000, current: userStats?.totalXP || 0, category: "achievement" },
      { id: "a-star-student", title: "Bintang Kelas", description: "Capai total 5.000 XP.", icon: Sparkles, reward: 1000, goal: 5000, current: userStats?.totalXP || 0, category: "achievement" },
      { id: "a-legend", title: "Legenda Evoca", description: "Capai skor total 10.000 XP.", icon: Zap, reward: 2500, goal: 10000, current: userStats?.totalXP || 0, category: "achievement" }
    ];

    return fullTemplates
      .filter(m => m.category === activeTab)
      .map(m => ({
        ...m,
        completed: m.current >= m.goal,
        claimed: m.category === "daily" 
          ? userStats?.completedMissions?.includes(`claim-${todayStr}-${m.id}`) ?? false
          : userStats?.completedMissions?.includes(`claim-${m.id}`) ?? false
      }));
  }, [userStats?.completedMissions, userStats?.dailyProgress, activeTab, userStats?.totalXP, todayStr]);

  const isQuestCompletedToday = useMemo(() => {
    const d = userStats?.dailyProgress?.[todayStr] || {};
    
    // Goals: m1: 1, m2: 5, m4: 1, m3: 1
    const m1Completed = (d.documentsUploaded || 0) >= 1;
    const m2Completed = (d.messagesSent || 0) >= 5;
    const m3Completed = (d.quizzesPerfect || 0) >= 1;
    const m4Completed = (d.podcastsFinished || 0) >= 1;

    return m1Completed || m2Completed || m3Completed || m4Completed;
  }, [userStats, todayStr]);

  const handleClaimReward = async (mission: MissionTemplate) => {
    if (claimingId) return;
    setClaimingId(mission.id);

    const claimKey = mission.category === "daily" ? `claim-${todayStr}-${mission.id}` : `claim-${mission.id}`;

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          documentId: "mission-reward",
          stage: claimKey,
          xpGained: 0,
          gemsGained: mission.reward
        }),
      });

      if (response.ok) {
        await refreshStats();
        setShowSuccess({ show: true, amount: mission.reward });
        setTimeout(() => setShowSuccess({ show: false, amount: 0 }), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen px-4 md:px-8 py-10 font-sans relative">
      
      {/* Success Celebration Overlay */}
      <AnimatePresence>
        {showSuccess.show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-indigo-500 text-center relative overflow-hidden">
               <div className="relative z-10">
                  <div className="text-6xl mb-4">💎</div>
                  <h2 className="text-3xl font-black text-indigo-600 uppercase mb-2">Hebat!</h2>
                  <p className="text-stone-500 font-bold uppercase text-xs tracking-widest">+ {showSuccess.amount} Permata Berhasil Diklaim</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1000px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ffc800] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 border-b-4 border-[#e5a500]">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black text-stone-900 tracking-tight uppercase">Misi Harian</h1>
            </div>
            <p className="text-stone-500 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">
              Selesaikan tantangan & kumpulkan permata untuk peliharaanmu!
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-white px-6 py-4 rounded-3xl border-2 border-stone-200 shadow-[0_4px_0_0_#e5e7eb] flex items-center gap-4 min-w-[140px]">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                   <span className="text-xl">💎</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Permata</p>
                  <p className="text-xl font-black text-indigo-600 leading-none">
                    <CountingNumber value={userStats?.gems ?? 0} />
                  </p>
                </div>
             </div>
             <Link href="/dashboard/pet" className="bg-white p-4 rounded-3xl border-2 border-stone-200 shadow-[0_4px_0_0_#e5e7eb] hover:translate-y-1 hover:shadow-none transition-all group">
                <Sparkles className="w-6 h-6 text-orange-400 group-hover:rotate-12 transition-transform" />
             </Link>
          </div>
        </header>

        {/* Level & Streak Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
           <div className={cn(
             "bg-stone-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group transition-all duration-700",
             !isQuestCompletedToday && "opacity-80 grayscale"
           )}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10 flex items-center gap-6">
                 <div className={cn(
                   "w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 transition-all duration-700",
                   isQuestCompletedToday ? "scale-110" : "grayscale opacity-50 scale-90"
                 )}>
                    <Flame className={cn(
                      "w-8 h-8 transition-colors duration-700",
                      isQuestCompletedToday ? "text-orange-400 fill-orange-400 animate-pulse" : "text-stone-500"
                    )} />
                 </div>
                 <div>
                    <h3 className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-1">Beruntun</h3>
                    <p className={cn(
                      "text-3xl font-black transition-colors duration-500",
                      isQuestCompletedToday ? "text-white" : "text-stone-400"
                    )}>
                      {String(userStats?.streak ?? 1)} Hari {isQuestCompletedToday ? "Aktif" : "Mati"}
                    </p>
                 </div>
              </div>
           </div>

           {(() => {
             const xp = userStats?.totalXP || 0;
             const currentLevel = Math.floor(xp / 100) + 1;
             const xpInCurrentLevel = xp % 100;
             const circumference = 175;
             const strokeDashoffset = circumference - (xpInCurrentLevel / 100) * circumference;
             
             return (
               <div className="bg-white rounded-[2.5rem] p-8 border-2 border-stone-200 shadow-[0_8px_0_0_#e5e7eb] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="relative w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#8b5cf6" strokeWidth="6" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset} 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600">
                          {currentLevel}
                        </div>
                     </div>
                     <div>
                        <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] mb-1">Level Saya</h3>
                        <p className="text-xl font-black text-stone-900 uppercase tracking-tight">
                          {currentLevel >= 10 ? "Legenda Evoca" : currentLevel >= 5 ? "Pelajar Bintang" : "Pemula Hebat"}
                        </p>
                     </div>
                  </div>
                  <Timer className="w-6 h-6 text-stone-200" />
               </div>
             );
           })()}
        </div>

        {/* Missions Filter/Tabs */}
        <div className="flex gap-4 mb-8">
           <button 
             onClick={() => setActiveTab("daily")}
             className={cn(
               "px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
               activeTab === "daily" 
                 ? "bg-stone-900 text-white shadow-xl" 
                 : "bg-white text-stone-400 border-2 border-stone-200 hover:border-stone-300"
             )}
           >
             Harian
           </button>
           <button 
             onClick={() => setActiveTab("achievement")}
             className={cn(
               "px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
               activeTab === "achievement" 
                 ? "bg-stone-900 text-white shadow-xl" 
                 : "bg-white text-stone-400 border-2 border-stone-200 hover:border-stone-300"
             )}
           >
             Pencapaian
           </button>
        </div>

        {/* Mission Cards Grid */}
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {currentMissions.map((mission, idx) => {
              const Icon = mission.icon;
              const progress = (mission.current / mission.goal) * 100;

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all duration-300 p-4 md:p-8 flex flex-row items-center gap-4 md:gap-8",
                    mission.completed 
                      ? "border-[#58cc02] shadow-[0_8px_0_0_#46a302]/20" 
                      : "border-stone-200 shadow-[0_4px_0_0_#e5e7eb]"
                  )}
                >
                  {/* Icon Wrapper */}
                  <div className={cn(
                    "w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 border-b-4",
                    mission.completed 
                      ? "bg-[#d7ffb8] text-[#58cc02] border-[#58cc02]/30" 
                      : "bg-stone-50 text-stone-400 border-stone-100"
                  )}>
                    <Icon className="w-7 h-7 md:w-10 md:h-10" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1 md:mb-3">
                      <h3 className="text-sm md:text-xl font-black text-stone-900 uppercase tracking-tight truncate">{mission.title}</h3>
                      {mission.completed && (
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#58cc02] text-white text-[9px] font-black uppercase rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </div>
                      )}
                    </div>
                    <p className="text-stone-500 font-medium text-[10px] md:text-sm leading-tight md:leading-relaxed mb-2 md:mb-6 line-clamp-2">{mission.description}</p>
                    
                    {/* Progress Bar (Desktop only or simple on mobile) */}
                    {!mission.claimed && (
                      <div className="space-y-1 md:space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest">Progress</span>
                             <span className="text-[10px] md:text-xs font-black text-stone-900">{mission.current}/{mission.goal}</span>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1.5 bg-indigo-50 rounded-lg md:rounded-xl border border-indigo-100">
                             <span className="text-[10px] md:text-sm">💎</span>
                             <span className="text-[10px] md:text-xs font-black text-indigo-600">+{mission.reward}</span>
                          </div>
                        </div>
                        <div className="h-2 md:h-4 bg-stone-100 rounded-full overflow-hidden p-0.5 md:p-1 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={cn(
                              "h-full rounded-full",
                              mission.completed ? "bg-[#58cc02]" : "bg-[#8b5cf6]"
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {mission.claimed ? (
                      <div className="flex flex-col items-center gap-1 text-stone-300 px-2 opacity-50">
                         <Star className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                         <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-center">Sudah<br/>Diambil</span>
                      </div>
                    ) : (
                      <div className="relative group/btn">
                        {mission.completed && !claimingId && (
                           <div className="absolute -top-1 md:-top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#8b5cf6] rotate-45 rounded-sm z-0" />
                        )}
                        <button
                          onClick={() => mission.completed && handleClaimReward(mission)}
                          disabled={!mission.completed || !!claimingId}
                          className={cn(
                            "relative z-10 w-20 md:w-32 py-3 md:py-4 rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest transition-all",
                            mission.completed
                              ? "bg-[#8b5cf6] text-white shadow-[0_6px_0_0_#7c3aed] active:shadow-none active:translate-y-1.5"
                              : "bg-stone-100 text-stone-400 border-2 border-stone-200 cursor-not-allowed"
                          )}
                        >
                          {claimingId === mission.id ? (
                             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto" />
                          ) : mission.completed ? (
                            "KLAIM"
                          ) : (
                            "NANTI"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Shop Promo */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 bg-linear-to-br from-indigo-600 to-indigo-700 rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group"
        >
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
           <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-[80px] -translate-x-1/2 -translate-y-1/2" />
           <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-6" />
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Punya Banyak Permata?</h2>
              <p className="text-indigo-100 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
                 Kunjungi toko peliharaan dan belikan aksesoris keren atau makanan lezat untuk meningkatkan level energimu!
              </p>
              <Link href="/dashboard/pet" className="inline-flex items-center gap-3 bg-white text-indigo-600 px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-transform active:scale-95">
                 Ke Pet Shop <ChevronRight className="w-4 h-4" />
              </Link>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
