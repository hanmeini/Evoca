"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { Loader2, CheckCircle2 } from "lucide-react";

export function SummaryFinishButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          stage: "summary",
          userId: user.uid,
          xpGained: 50
        }),
      });

      setCompleted(true);
      setTimeout(() => {
        router.push(`/ai-reader/${documentId}`);
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="bg-[#ffc800] text-white font-black px-12 py-4 rounded-2xl shadow-lg border-b-8 border-[#e5a500] uppercase tracking-widest text-sm flex items-center gap-2 transform transition-all duration-500 scale-105">
        <CheckCircle2 className="w-6 h-6" /> Misi Selesai! +50 XP
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="bg-[#58cc02] hover:bg-[#46a302] text-white font-black px-12 py-4 rounded-2xl shadow-lg border-b-8 border-[#46a302] active:border-b-0 active:translate-y-2 transition-all uppercase tracking-widest text-sm flex items-center justify-center min-w-[200px]"
    >
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Selesaikan Tahap 1 ✨"}
    </button>
  );
}
