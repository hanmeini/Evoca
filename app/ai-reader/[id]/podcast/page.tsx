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
} from "lucide-react";
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
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-stone-900 animate-spin mb-4 mx-auto" />
        <p className="font-serif text-xl font-medium text-stone-900">
          Membuat Siniar AI...
        </p>
        <p className="text-stone-500 text-sm">
          Meringkas dokumen menjadi skrip percakapan.
        </p>
      </div>
    );
  }

  if (error || script.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <XCircle className="w-8 h-8 text-rose-600 mb-4 mx-auto" />
        <p className="font-serif text-xl font-medium text-stone-900 mb-2">
          Gagal Memuat Siniar
        </p>
        <p className="text-stone-500 text-sm max-w-sm mx-auto">
          {error || "AI tidak dapat membuat siniar dari teks ini."}
        </p>
      </div>
    );
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="bg-stone-900 rounded-2xl p-8 md:p-14 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 rounded-full mix-blend-screen filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-800 rounded-full mix-blend-screen filter blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
          <div className="shrink-0 relative group">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl shadow-2xl bg-linear-to-br from-stone-200 to-stone-400 p-1">
              <div className="w-full h-full bg-stone-100 rounded-lg flex flex-col items-center justify-center p-6 text-center border overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-stone-50 via-stone-100 to-stone-200 opacity-80" />
                <h3 className="relative z-10 font-serif font-bold text-xl text-stone-900 leading-tight mb-2">
                  Ringkasan Audio Dokumen
                </h3>
                <p className="relative z-10 text-xs font-sans font-bold uppercase tracking-widest text-stone-500">
                  Dibuat oleh AI
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full text-stone-100">
            <div className="mb-8 text-center md:text-left">
              <h2 className="font-serif text-3xl font-bold mb-2">
                Ringkasan Audio Dokumen
              </h2>
              <p className="text-stone-400 font-medium">
                Siniar 2-orang buatan AI
              </p>
            </div>

            <div className="mb-8">
              <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mb-2 cursor-pointer">
                <div
                  className="h-full bg-stone-300 rounded-full relative transition-all duration-300"
                  style={{
                    width: `${(currentLineIndex / Math.max(script.length - 1, 1)) * 100}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                </div>
              </div>
              <div className="flex justify-between text-xs font-medium text-stone-500 font-mono">
                <span>Trk {currentLineIndex + 1}</span>
                <span>Trk {script.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button className="text-stone-400 hover:text-white transition-colors">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-6 md:gap-8 flex-1 justify-center">
                <button
                  onClick={() =>
                    setCurrentLineIndex(Math.max(0, currentLineIndex - 1))
                  }
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <Rewind className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlayback}
                  className="w-16 h-16 bg-white text-stone-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
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
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <FastForward className="w-6 h-6" />
                </button>
              </div>
              <div className="w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-2xl mx-auto">
        <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 text-center">
          Pratinjau Transkrip
        </h3>
        <div className="space-y-6">
          {script.map((line, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-4 p-3 rounded-xl transition-colors duration-300",
                currentLineIndex === idx
                  ? "bg-stone-100 ring-1 ring-stone-300"
                  : "",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold",
                  line.speaker === "A"
                    ? "bg-stone-200 text-stone-600"
                    : "bg-stone-800 text-stone-100",
                )}
              >
                {line.speaker}
              </div>
              <div>
                <p className="text-stone-800 leading-relaxed font-serif">
                  {line.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
