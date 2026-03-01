"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Trophy,
  Settings,
  LogOut,
  Star,
  Flame,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect } from "react";

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
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Library, label: "My Library", href: "/dashboard/library" },
    { icon: Trophy, label: "Leaderboard", href: "/dashboard/leaderboard" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-stone-200">
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-900 group"
          >
            <div className="p-1.5 bg-stone-900 text-white rounded-lg group-hover:bg-rose-600 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">
              Evoca
            </span>
          </Link>
        </div>

        {/* User Mini Profile / Gamification Stats */}
        <div className="p-6 border-b border-stone-200 bg-stone-50/50">
          <div className="flex items-center gap-3 mb-4">
            {user?.photoURL ? (
              <div className="relative w-10 h-10 rounded-full border-2 border-white shadow-inner overflow-hidden">
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 shadow-inner flex items-center justify-center text-white font-bold text-lg border-2 border-white">
                {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-900 leading-tight truncate">
                {user?.displayName || "Student"}
              </p>
              <p className="text-xs text-stone-500 font-medium tracking-wide flex items-center gap-1">
                <Star className="w-3 h-3 text-orange-500 fill-orange-500 shrink-0" />
                <span className="truncate">Level 1 Scholar</span>
              </p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-500">2,450 XP</span>
              <span className="text-stone-400">3,000 XP</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-orange-500 h-full w-[81%] rounded-full" />
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold text-stone-700">
              7 Day Streak
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-rose-600" : "text-stone-400"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-stone-200">
          <button
            onClick={logOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-stone-500 hover:bg-stone-100 hover:text-rose-600 transition-colors w-full text-left group" // Fixed duplicate hover rule and added group
          >
            <LogOut className="w-5 h-5 text-stone-400 group-hover:text-rose-600" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
}
