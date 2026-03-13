"use client";

import { PathMap } from "@/src/components/reader/PathMap";
import { THEMES } from "@/src/components/reader/PathNode";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState, Suspense } from "react";

function AiReaderPathContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme") as keyof typeof THEMES | null;
  const theme = themeParam && THEMES[themeParam] ? themeParam : "evoca1";

  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const response = await fetch(`/api/document/${id}`);
        const result = await response.json();

        if (result.success && result.data) {
          const data = result.data;
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

          const completedStages = data.completedStages || [];

          if (completedStages.includes("summary") || data.quizData) {
            baseStages[0].status = "completed";
            baseStages[1].status = "current";
          }
          if (completedStages.includes("quiz") || data.podcastScript) {
            baseStages[1].status = "completed";
            baseStages[2].status = "current";
          }
          if (completedStages.includes("podcast") || (data.chatHistory && data.chatHistory.length > 0)) {
            baseStages[2].status = "completed";
            baseStages[3].status = "current";
          }
          if (completedStages.includes("chat")) {
            baseStages[3].status = "completed";
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
    const t = THEMES[theme];
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div
          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: t.bgValue, borderTopColor: "transparent" }}
        />
        <p
          className="font-black uppercase tracking-widest text-xs"
          style={{ color: t.bgValue }}
        >
          Mempersiapkan Petualangan...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PathMap stages={stages} title="Misi Belajar" theme={theme} />
    </div>
  );
}

export default function AiReaderPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AiReaderPathContent params={params} />
    </Suspense>
  );
}
