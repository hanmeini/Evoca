"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Target, // Replaced Settings with Target/Misi
  LogOut,
  Star,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Protect route
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Beranda", href: "/dashboard" },
    { icon: Trophy, label: "Papan Skor", href: "/dashboard/leaderboard" },
    { icon: Target, label: "Misi Harian", href: "/dashboard/missions" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "circOut" }}
        className="hidden md:flex w-72 bg-white border-r-2 border-stone-200 flex-col fixed inset-y-0 left-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
        <div className="p-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-stone-900 group"
          >
            <div className="w-14 h-14 relative group-hover:rotate-6 transition-transform duration-500">
              <Image 
                src="/favicon.ico" 
                alt="Evoca Logo" 
                fill 
                className="object-contain"
                sizes="56px"
                priority
              />
            </div>
            <span className="font-[family-name:var(--font-lato)] font-black text-4xl tracking-tighter uppercase text-stone-950">
              Evoca
            </span>
          </Link>
        </div>


        {/* Navigation - High Interactivity */}
        <nav className="flex flex-col px-8 space-y-2 mt-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{
                    scale: 0.95,
                    y: 4,
                    boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                  }}
                  className={cn(
                    "flex items-center justify-between px-5 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all group",
                    isActive
                      ? "bg-white border-2 border-[#8b5cf6] text-[#8b5cf6] shadow-[0_4px_0_0_#8b5cf6]"
                      : "text-stone-400 hover:bg-white hover:border-2 hover:border-stone-200 hover:text-stone-700 shadow-[0_4px_0_0_#e5e7eb]",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive
                          ? "text-[#8b5cf6]"
                          : "text-stone-300 group-hover:text-[#8b5cf6]",
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-[#8b5cf6] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Section: Profile & Logout */}
        <div className="mt-auto px-6 pb-6 space-y-4">
          {/* User Profile - Matching Nav Style */}
          <Link href="/dashboard/profile">
            {(() => {
              const isActive = pathname === "/dashboard/profile";
              return (
                <motion.div
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{
                    scale: 0.95,
                    y: 4,
                    boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                  }}
                  className={cn(
                    "flex items-center justify-between px-5 py-3 rounded-3xl font-black text-xs uppercase tracking-widest transition-all group",
                    isActive
                      ? "bg-white border-2 border-[#8b5cf6] text-[#8b5cf6] shadow-[0_4px_0_0_#8b5cf6]"
                      : "text-stone-400 hover:bg-white hover:border-2 hover:border-stone-200 hover:text-stone-700 shadow-[0_4px_0_0_#e5e7eb]",
                  )}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-8 h-8 shrink-0">
                      {user?.photoURL ? (
                        <div className="w-full h-full rounded-lg shadow-sm overflow-hidden relative border border-stone-100">
                          <Image
                            src={user.photoURL}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-lg bg-linear-to-tr from-[#8b5cf6] to-[#a78bfa] shadow-sm flex items-center justify-center text-white font-black text-[10px] border border-white/20">
                          {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                        <Star className="w-1.5 h-1.5 text-white fill-white" />
                      </div>
                    </div>
                    <span className="truncate flex-1 text-left">{user?.displayName || "Profil Saya"}</span>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-[#8b5cf6] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)] shrink-0" />
                  )}
                </motion.div>
              );
            })()}
          </Link>

          {/* Logout Section */}
          <div className="border-t font-sans border-stone-100 pt-4">
            <motion.button
              whileHover={{ scale: 0.98 }}
              onClick={logOut}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 border-2 border-dashed border-stone-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-all group"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Keluar
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area - Refined Spacing */}
      <main className="flex-1 md:ml-72 pb-24 md:pb-0 min-h-screen relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        <div className="relative z-10 px-0 md:p-8">{children}</div>
      </main>

    </div>
  );
}
