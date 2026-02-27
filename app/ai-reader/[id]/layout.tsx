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
    <div className="flex-1 flex flex-col w-full">
      {/* Reader Header */}
      <header className="border-b border-stone-200 bg-white sticky top-16 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Perpustakaan
          </Link>

          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-stone-900 mb-6">
            Pembaca Dokumen AI
          </h1>

          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-stone-900 text-stone-50"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 bg-stone-50/50">{children}</div>
    </div>
  );
}
