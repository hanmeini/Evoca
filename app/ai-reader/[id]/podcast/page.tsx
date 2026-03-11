"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Volume2,
  Loader2,
  XCircle,
  Headphones,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { use } from "react";

type ScriptLine = {
  speaker: "A" | "B";
  text: string;
};

export default function AiReaderPodcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isPlaying, setIsPlaying] = useState(false);
  const [script, setScript] = useState<ScriptLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadPodcast() {
      try {
        const response = await fetch(`/api/generate-podcast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: id }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to load podcast script");

        if (data.script && data.script.length > 0) {
          setScript(data.script);
        } else {
          setError("No script generated.");
        }
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadPodcast();
  }, [id]);

  useEffect(() => {
    if (!isPlaying) {
      audioRef.current?.pause();
      return;
    }

    const playCurrentLine = async () => {
      if (currentLineIndex >= script.length) {
        setIsPlaying(false);
        setCurrentLineIndex(0);
        return;
      }

      const line = script[currentLineIndex];

      try {
        const response = await fetch("/api/podcast-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line.text, speakerId: line.speaker }),
        });

        if (!response.ok) {
          throw new Error("Failed to load audio for current line.");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setCurrentLineIndex((prev) => prev + 1);
        };

        audio.play();
      } catch (err) {
        console.error("Audio Playback Error:", err);
        // Skip track and play next on error
        setCurrentLineIndex((prev) => prev + 1);
      }
    };

    playCurrentLine();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlaying, currentLineIndex, script]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center animate-pulse">
        <div className="w-20 h-20 bg-[#C4B5FD] rounded-3xl flex items-center justify-center mb-6 shadow-xl border-4 border-white animate-bounce-slow">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <p className="font-serif text-2xl font-black text-stone-900 mb-2">
          Membuat Siniar AI...
        </p>
        <p className="text-stone-500 font-medium">
          Meringkas dokumen menjadi skrip percakapan interaktif.
        </p>
      </div>
    );
  }

  if (error || script.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl border-4 border-white">
          <XCircle className="w-10 h-10 text-white" />
        </div>
        <p className="font-serif text-2xl font-black text-rose-950 mb-2">
          Gagal Memuat Siniar
        </p>
        <p className="text-rose-600/80 font-medium max-w-sm mx-auto">
          {error || "AI tidak dapat membuat siniar dari teks ini."}
        </p>
      </div>
    );
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href={`/ai-reader/${id}`}
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-black uppercase text-xs tracking-widest mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 stroke-[3px]" />
        Kembali ke Jalur Belajar
      </Link>

      <div className="bg-[#E0E7FF] border-4 border-white rounded-[3rem] p-8 md:p-14 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
          <div className="shrink-0 relative group">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[2rem] shadow-xl bg-gradient-to-br from-indigo-400 to-fuchsia-400 p-2 animate-bounce-slow">
              <div className="w-full h-full bg-white rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white" />
                <Headphones className="w-16 h-16 text-indigo-500 mb-4 relative z-10" />
                <h3 className="relative z-10 font-serif font-black text-xl text-indigo-950 leading-tight mb-2">
                  Podcast Belajar
                </h3>
                <p className="relative z-10 text-[10px] font-sans font-bold uppercase tracking-widest text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full">
                  Dibuat oleh AI
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full text-stone-900">
            <div className="mb-10 text-center md:text-left">
              <h2 className="font-serif text-3xl md:text-4xl font-black mb-3 text-indigo-950">
                Siniar Ringkasan
              </h2>
              <p className="text-indigo-600/80 font-bold tracking-wide">
                Diskusi 2-orang buatan AI
              </p>
            </div>

            <div className="mb-10">
              <div className="w-full h-3 bg-white/50 border-2 border-white rounded-full overflow-hidden mb-3 cursor-pointer shadow-sm relative">
                <div
                  className="h-full bg-indigo-500 rounded-full relative transition-all duration-300 shadow-md"
                  style={{
                    width: `${(currentLineIndex / Math.max(script.length - 1, 1)) * 100}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-lg" />
                </div>
              </div>
              <div className="flex justify-between text-xs font-bold text-indigo-800 uppercase tracking-widest">
                <span>Trk {currentLineIndex + 1}</span>
                <span>Trk {script.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button className="w-12 h-12 bg-white/50 text-indigo-700 rounded-2xl flex items-center justify-center hover:bg-white hover:shadow-md transition-all">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 md:gap-6 flex-1 justify-center">
                <button
                  onClick={() =>
                    setCurrentLineIndex(Math.max(0, currentLineIndex - 1))
                  }
                  className="w-14 h-14 bg-white text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-1 transition-all shadow-md"
                >
                  <Rewind className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlayback}
                  className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-indigo-700 hover:shadow-xl transition-all shadow-lg border-4 border-white"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  )}
                </button>
                <button
                  onClick={() =>
                    setCurrentLineIndex(
                      Math.min(script.length - 1, currentLineIndex + 1),
                    )
                  }
                  className="w-14 h-14 bg-white text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-1 transition-all shadow-md"
                >
                  <FastForward className="w-6 h-6" />
                </button>
              </div>
              <div className="w-12" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-2xl mx-auto">
        <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 text-center">
          Pratinjau Transkrip
        </h3>
        <div className="space-y-4">
          {script.map((line, idx) => {
            const isActive = currentLineIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "flex gap-4 p-5 rounded-3xl transition-all duration-500",
                  isActive
                    ? "bg-white shadow-xl scale-[1.02] border border-stone-100"
                    : "bg-transparent hover:bg-stone-50",
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-sm font-black shadow-sm",
                    line.speaker === "A"
                      ? "bg-fuchsia-100 text-fuchsia-600"
                      : "bg-emerald-100 text-emerald-600",
                    isActive && "animate-pulse",
                  )}
                >
                  {line.speaker}
                </div>
                <div className="pt-1">
                  <p
                    className={cn(
                      "leading-relaxed",
                      isActive
                        ? "font-bold text-stone-900"
                        : "font-medium text-stone-600",
                    )}
                  >
                    {line.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Finish Button */}
        <div className="mt-12 flex justify-center pb-20">
          <Link
            href={`/ai-reader/${id}`}
            className="bg-[#58cc02] text-white font-black px-12 py-4 rounded-2xl shadow-lg border-b-8 border-[#46a302] active:border-b-0 active:translate-y-2 transition-all uppercase tracking-widest text-sm"
          >
            Selesaikan Tahap 3 ✨
          </Link>
        </div>
      </div>
    </div>
  );
}
