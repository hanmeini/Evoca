"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Target } from "lucide-react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Beranda", href: "/dashboard" },
    { icon: Trophy, label: "Papan Skor", href: "/dashboard/leaderboard" },
    { icon: Target, label: "Misi Harian", href: "/dashboard/missions" },
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
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300" />
                <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight line-clamp-1">
                  {item.label}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
      {/* Profile Link Mobile */}
      <Link href="/dashboard/profile" className="group flex-1 mx-1 flex justify-center">
        <div
          className={cn(
             "flex flex-col items-center justify-center w-full max-w-[80px] py-2 px-1 rounded-2xl transition-all group-active:scale-95 group-active:translate-y-1",
             pathname === "/dashboard/profile"
                ? "bg-white border-2 border-[#8b5cf6] text-[#8b5cf6] shadow-[0_4px_0_0_#8b5cf6]"
                : "text-stone-400 border-2 border-transparent hover:bg-white hover:border-stone-200 hover:text-stone-700 shadow-[0_4px_0_0_transparent] hover:shadow-[0_4px_0_0_#e5e7eb]"
          )}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 shrink-0">
               {user?.photoURL ? (
                 <div className={cn("w-full h-full rounded-md shadow-sm overflow-hidden relative border", pathname === "/dashboard/profile" ? "border-transparent" : "border-stone-200")}>
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                 </div>
               ) : (
                 <div className={cn("w-full h-full rounded-md flex items-center justify-center text-white font-black text-[8px] sm:text-[10px] shadow-sm", pathname === "/dashboard/profile" ? "bg-linear-to-tr from-[#8b5cf6] to-[#a78bfa]" : "bg-stone-300")}>
                    {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                 </div>
               )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight line-clamp-1 text-inherit">
              Profil
            </span>
          </div>
        </div>
      </Link>
    </nav>
  );
}
