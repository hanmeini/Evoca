"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Target, LogOut, User, PawPrint } from "lucide-react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useMemo, useState } from "react";
import { getTodayStr } from "@/src/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, userStats, logOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const hasClaimableMissions = useMemo(() => {
    if (!userStats) return false;
    const todayStr = getTodayStr();
    const d = userStats.dailyProgress?.[todayStr] || {};
    
    const dailyTemplates = [
      { id: "daily-visit", goal: 1, current: 1 },
      { id: "m1", goal: 1, current: d.documentsUploaded || 0 },
      { id: "m2", goal: 5, current: d.messagesSent || 0 },
      { id: "m4", goal: 1, current: d.podcastsFinished || 0 },
      { id: "m3", goal: 1, current: d.quizzesPerfect || 0 },
    ];

    const achievementTemplates = [
      { id: "a-exemplary", goal: 10, current: userStats.totalDocs || 0 },
      { id: "a-star-student", goal: 50, current: userStats.completedMissionsCount || 0 },
      { id: "a-legend", goal: 5000, current: userStats.gems || 0 },
    ];

    const hasDaily = dailyTemplates.some(m => 
      m.current >= m.goal && 
      !userStats.completedMissions?.includes(`claim-${todayStr}-${m.id}`)
    );

    const hasAchievement = achievementTemplates.some(m => 
      m.current >= m.goal && 
      !userStats.completedMissions?.includes(`claim-${m.id}`)
    );

    return hasDaily || hasAchievement;
  }, [userStats]);

  const navItems = [
    { icon: LayoutDashboard, label: "Beranda", href: "/dashboard" },
    { icon: Target, label: "Misi Harian", href: "/dashboard/missions", hasBadge: hasClaimableMissions },
    { icon: Trophy, label: "Peringkat", href: "/dashboard/leaderboard" },
    { icon: PawPrint, label: "Peliharaan", href: "/dashboard/pet" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex items-center justify-around px-4 py-3 z-50 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="group flex-1 mx-1 flex justify-center">
            <div
              className={cn(
                "flex flex-col items-center justify-center w-full max-w-[80px] py-2 px-1 rounded-2xl transition-all group-active:scale-95 group-active:translate-y-1",
                isActive
                  ? "bg-white border-2 border-[#8b5cf6] text-[#8b5cf6] shadow-[0_4px_0_0_#8b5cf6]"
                  : "text-stone-400 border-2 border-transparent hover:bg-white hover:border-stone-200 hover:text-stone-700 shadow-[0_4px_0_0_transparent] hover:shadow-[0_4px_0_0_#e5e7eb]",
              )}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300" />
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                  )}
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight line-clamp-1">
                  {item.label}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
      {/* Profile Button Mobile */}
      <div className="group flex-1 mx-1 flex justify-center relative">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex justify-center focus:outline-none"
        >
          <div
            className={cn(
               "flex flex-col items-center justify-center w-full max-w-[80px] py-2 px-1 rounded-2xl transition-all group-active:scale-95 group-active:translate-y-1",
               pathname === "/dashboard/settings"
                  ? "bg-white border-2 border-[#8b5cf6] text-[#8b5cf6] shadow-[0_4px_0_0_#8b5cf6]"
                  : "text-stone-400 border-2 border-transparent hover:bg-white hover:border-stone-200 hover:text-stone-700 shadow-[0_4px_0_0_transparent] hover:shadow-[0_4px_0_0_#e5e7eb]"
            )}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 shrink-0">
                 {user?.photoURL ? (
                   <div className={cn("w-full h-full rounded-md shadow-sm overflow-hidden relative border", pathname === "/dashboard/settings" ? "border-transparent" : "border-stone-200")}>
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                   </div>
                 ) : (
                   <div className={cn("w-full h-full rounded-md flex items-center justify-center text-white font-black text-[8px] sm:text-[10px] shadow-sm", pathname === "/dashboard/settings" ? "bg-linear-to-tr from-[#8b5cf6] to-[#a78bfa]" : "bg-stone-300")}>
                      {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                   </div>
                 )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight line-clamp-1 text-inherit">
                Profil
              </span>
            </div>
          </div>
        </button>

        {/* Profile Menu Popup */}
        {showProfileMenu && (
          <div className="absolute bottom-[calc(100%+12px)] right-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200 p-2 w-48 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
            <button
              onClick={() => {
                setShowProfileMenu(false);
                if (logOut) logOut();
              }}
              className="flex items-center gap-3 w-full p-3 font-bold text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Keluar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
