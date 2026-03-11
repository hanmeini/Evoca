"use client";

import { PathMap } from "@/src/components/reader/PathMap";
import { use, useEffect, useState } from "react";

export default function AiReaderPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const response = await fetch(`/api/document/${id}`);
        const result = await response.json();

        if (result.success && result.data) {
          const data = result.data;
          // For now, let's hardcode the stages but we could drive this from Firestore data later
          const baseStages: any[] = [
            {
              id: 1,
              type: "summary",
              label: "Tahap 1: Materi",
              href: `/ai-reader/${id}/summary`,
              status: "current",
            },
            {
              id: 2,
              type: "quiz",
              label: "Tahap 2: Kuis",
              href: `/ai-reader/${id}/quiz`,
              status: "locked",
            },
            {
              id: 3,
              type: "podcast",
              label: "Tahap 3: Podcast",
              href: `/ai-reader/${id}/podcast`,
              status: "locked",
            },
            {
              id: 4,
              type: "chat",
              label: "Tahap 4: Diskusi AI",
              href: `/ai-reader/${id}/chat`,
              status: "locked",
            },
          ];

          // Simple logic: if quizData exists, mark summary as completed and quiz as current
          if (data.quizData) {
            baseStages[0].status = "completed";
            baseStages[1].status = "current";
          }
          // If podcastScript exists, mark quiz as completed and podcast as current
          if (data.podcastScript) {
            baseStages[1].status = "completed";
            baseStages[2].status = "current";
          }
          // If chatHistory exists, mark podcast as completed and chat as current
          if (data.chatHistory && data.chatHistory.length > 0) {
            baseStages[2].status = "completed";
            baseStages[3].status = "current";
          }

          setStages(baseStages);
        }
      } catch (error) {
        console.error("Error fetching doc for path:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-[#58cc02] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#58cc02] uppercase tracking-widest text-xs">
          Mempersiapkan Petualangan...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PathMap stages={stages} title="Misi Belajar" />
    </div>
  );
}
