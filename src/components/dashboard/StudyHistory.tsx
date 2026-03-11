"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ChevronRight,
  Clock,
  MessageSquare,
  Brain,
  Headphones,
} from "lucide-react";
import Link from "next/link";

interface DocumentHistory {
  id: string;
  fileName: string;
  createdAt: string;
  metadata?: {
    title?: string;
    summary?: string;
  };
}

export function StudyHistory() {
  const [history, setHistory] = useState<DocumentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/history");
        const data = await response.json();
        if (data.success && data.history) {
          setHistory(data.history);
        }
      } catch (error) {
        console.error("Error fetching study history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-stone-100 animate-pulse rounded-3xl"
          />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-stone-200 text-center">
        <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-stone-400" />
        </div>
        <p className="text-stone-500 font-medium">
          Belum ada misi yang diselesaikan.
        </p>
        <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-black">
          Mulai Misi Pertama Kamu!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-all group"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-stone-900 truncate">
                  {doc.metadata?.title || doc.fileName}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  {doc.metadata?.summary && (
                    <p className="text-xs text-stone-400 truncate line-clamp-1 max-w-md hidden sm:block">
                      • {doc.metadata.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <Link
                href={`/ai-reader/${doc.id}`}
                className="p-2 bg-stone-50 hover:bg-white hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm"
                title="Review"
              >
                <FileText className="w-4 h-4" />
              </Link>
              <Link
                href={`/ai-reader/${doc.id}/quiz`}
                className="p-2 bg-stone-50 hover:bg-white hover:text-amber-500 rounded-xl transition-all border border-transparent hover:border-amber-100 shadow-sm"
                title="Quiz"
              >
                <Brain className="w-4 h-4" />
              </Link>
              <Link
                href={`/ai-reader/${doc.id}/podcast`}
                className="p-2 bg-stone-50 hover:bg-white hover:text-indigo-500 rounded-xl transition-all border border-transparent hover:border-indigo-100 shadow-sm"
                title="Podcast"
              >
                <Headphones className="w-4 h-4" />
              </Link>
              <Link
                href={`/ai-reader/${doc.id}/chat`}
                className="p-2 bg-stone-50 hover:bg-white hover:text-fuchsia-500 rounded-xl transition-all border border-transparent hover:border-fuchsia-100 shadow-sm"
                title="Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
              <div className="w-px h-8 bg-stone-100 mx-1" />
              <Link
                href={`/ai-reader/${doc.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-black hover:bg-stone-800 transition-colors"
              >
                Lanjutkan
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
