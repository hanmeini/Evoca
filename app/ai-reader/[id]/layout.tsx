"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, NotebookTabs } from "lucide-react";
import { use } from "react";
import { THEMES } from "@/src/components/reader/PathNode";

export default function AiReaderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [docTitle, setDocTitle] = useState("Loading...");
  const [headerColor, setHeaderColor] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const t = searchParams.get("theme") as keyof typeof THEMES | null;
    if (t && THEMES[t]) {
      setHeaderColor((THEMES[t] as any).header);
    }
  }, []);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const response = await fetch(`/api/document/${id}`);
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          setDocTitle(
            data.metadata?.title || data.fileName || "Untitiled Document",
          );
          setPdfUrl(data.fileUrl || null);
        }
      } catch (error) {
        console.error("Error fetching doc in layout:", error);
      }
    }
    fetchDoc();
  }, [id]);

  const handleOpenPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    } else {
      alert("PDF aslinya tidak ditemukan.");
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full bg-[#f7f7f7] min-h-screen">
      {/* Evoca Dynamic Header */}
      <header
        className={`sticky top-0 z-40 text-white shadow-md transition-colors duration-500 ${!headerColor ? "bg-gradient-to-r from-purple-600 to-blue-500" : ""}`}
        style={headerColor ? { backgroundColor: headerColor } : {}}
      >
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 stroke-[3px]" />
            </Link>

            <div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80 decoration-white/50 underline-offset-4 mb-1">
                BAGIAN 1, UNIT 1
              </p>
              <h1 className="font-black text-lg md:text-2xl leading-tight line-clamp-1">
                {docTitle}
              </h1>
            </div>
          </div>

          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all border-b-4 border-black/10 active:border-b-0 active:translate-y-1"
            >
              <NotebookTabs className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Lihat PDF Asli</span>
              <span className="sm:hidden">PDF Asli</span>
            </a>
          ) : (
            <button
              onClick={() => alert("Data PDF asli tidak ditemukan atau masih diproses.")}
              className="bg-white/10 text-white/50 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest cursor-not-allowed"
            >
              <NotebookTabs className="w-4 h-4 md:w-5 md:h-5 opacity-50" />
              <span className="hidden sm:inline">PDF Asli (N/A)</span>
              <span className="sm:hidden">N/A</span>
            </button>
          )}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 w-full pb-24 md:pb-12">{children}</div>
    </div>
  );
}
