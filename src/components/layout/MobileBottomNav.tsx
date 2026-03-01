"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Phone, MessageSquare, User } from "lucide-react";
import { cn } from "@/src/lib/utils"; // Assuming utils exists for cn, if not I'll fix it

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Reminders", href: "/dashboard/reminders", icon: Calendar },
    { name: "Calls", href: "/dashboard/calls", icon: Phone },
    { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden">
      <div className="bg-white rounded-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.05)] px-6 py-4 flex items-center justify-between border border-stone-100">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive
                    ? "bg-stone-900 text-white"
                    : "text-stone-400 group-hover:text-stone-900 group-hover:bg-stone-100",
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-stone-900" : "text-stone-400",
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
