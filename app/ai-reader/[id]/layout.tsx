"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BookText,
  Headphones,
  MessageSquareText,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

import { use } from "react";

export default function AiReaderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const pathname = usePathname();
  const { id } = use(params);

  const tabs = [
    { name: "Overview", href: `/ai-reader/${id}`, icon: BookText },
    { name: "Quiz", href: `/ai-reader/${id}/quiz`, icon: BookText },
    { name: "Podcast", href: `/ai-reader/${id}/podcast`, icon: Headphones },
    { name: "Chat", href: `/ai-reader/${id}/chat`, icon: MessageSquareText },
  ];

  return (
    <div className="flex-1 flex flex-col w-full bg-[var(--color-evoca-bg)] min-h-screen">
      {/* Reader Header */}
      <header className="sticky top-6 z-40 px-4 mt-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between bg-white rounded-[2rem] p-4 shadow-xl border border-white">
          <Link
            href="/dashboard"
            className="hidden md:flex items-center justify-center w-12 h-12 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Mobile Back Button */}
          <div className="w-full flex justify-between items-center md:hidden mb-4 px-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-bold text-stone-500"
            >
              <ArrowLeft className="w-4 h-4" /> Library
            </Link>
            <h1 className="font-serif text-lg font-black text-stone-900">
              AI Reader
            </h1>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-2 w-full md:w-auto md:ml-auto">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-rose-500 text-white shadow-md -translate-y-0.5"
                      : "bg-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-white" : "text-stone-400",
                    )}
                  />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 w-full pt-4 pb-24 md:pb-12">{children}</div>
    </div>
  );
}
