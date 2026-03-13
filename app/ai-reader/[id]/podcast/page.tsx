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
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
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
  const [trackProgress, setTrackProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Audio Preloading Cache
  const audioCache = useRef<Record<number, string>>({});
  const fetchPromises = useRef<Record<number, Promise<string | null>>>({});

  const preloadAudio = async (index: number, scriptLines: ScriptLine[]) => {
    if (index >= scriptLines.length) return null;
    if (audioCache.current[index]) return audioCache.current[index];
    if (fetchPromises.current[index] !== undefined) return fetchPromises.current[index];

    const promise = (async () => {
      try {
        const line = scriptLines[index];
        const response = await fetch("/api/podcast-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line.text, speakerId: line.speaker }),
        });
        if (!response.ok) throw new Error("Failed to load audio");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioCache.current[index] = url;
        return url;
      } catch (err) {
        console.error("Preload error:", err);
        return null;
      }
    })();

    fetchPromises.current[index] = promise;
    return promise;
  };

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

      try {
        // Preload next immediate lines in the background
        preloadAudio(currentLineIndex + 1, script);
        if (currentLineIndex + 2 < script.length) {
          preloadAudio(currentLineIndex + 2, script);
        }

        const audioUrl = await preloadAudio(currentLineIndex, script);
        if (!audioUrl) throw new Error("Failed connecting to cached audio.");

        if (audioRef.current) {
          audioRef.current.pause();
          // DO NOT revoke URL here, as it's cached for fast scrubbing!
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = async () => {
          setTrackProgress(0);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);

          if (currentLineIndex >= script.length - 1) {
            setIsPlaying(false);
            if (!isCompleted) {
              setIsCompleted(true);
              setUserXP((prev) => prev + 50);
              const currentUser = user;
              if (currentUser) {
                try {
                  await fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documentId: id, stage: "podcast", userId: currentUser.uid, xpGained: 50 }),
                  });
                  router.refresh();
                } catch (e) {
                  console.error(e);
                }
              }
            }
          } else {
            // Introduce a natural conversational pause (e.g. 400ms) before the next speaker
            setTimeout(() => {
              setCurrentLineIndex((prev) => prev + 1);
            }, 400);
          }
        };

        const smoothlyUpdateProgress = () => {
          if (audio && audio.duration) {
            setTrackProgress(audio.currentTime / audio.duration);
          }
          if (!audio.paused && !audio.ended) {
            animationRef.current = requestAnimationFrame(smoothlyUpdateProgress);
          }
        };

        audio.onplay = () => {
          animationRef.current = requestAnimationFrame(smoothlyUpdateProgress);
        };

        audio.onpause = () => {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("Playback interrupted:", err);
          });
        }
      } catch (err) {
        console.error("Audio Playback Error:", err);
        // Skip track and play next on error
        setTrackProgress(0);
        setCurrentLineIndex((prev) => prev + 1);
      }
    };

    playCurrentLine();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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
              <div className="w-full h-3 bg-white/50 border-2 border-white rounded-full overflow-hidden mb-3 md:mb-4 cursor-pointer shadow-sm relative">
                <div
                  className="h-full bg-indigo-500 rounded-full relative shadow-md will-change-auto"
                  style={{
                    width: `${((currentLineIndex + trackProgress) / Math.max(script.length, 1)) * 100}%`,
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

            <div className="flex items-center justify-between min-h-[5rem]">
              {isCompleted ? (
                <div className="w-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="bg-[#ffc800] text-white px-5 py-2.5 rounded-2xl shadow-lg border-b-4 border-[#e5a500] flex items-center gap-3 mb-6 transform scale-110">
                    <span className="text-xl">🎉</span>
                    <div className="flex flex-col items-start leading-none">
                      <p className="font-black uppercase tracking-widest text-[11px] text-amber-900 border-b border-amber-900/10 pb-1 mb-1 shadow-sm font-sans w-full text-left">Misi Selesai!</p>
                      <p className="font-bold text-[10px] text-amber-800 font-sans">+50 XP Diraih</p>
                    </div>
                  </div>
                  <Link
                    href={`/ai-reader/${id}`}
                    className="bg-[#58cc02] hover:bg-[#46a302] text-white font-black px-12 py-4 rounded-2xl shadow-lg border-b-8 border-[#46a302] active:border-b-0 active:translate-y-2 transition-all uppercase tracking-widest text-sm flex items-center gap-2 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    Lanjut ke Peta <ChevronLeft className="w-5 h-5 rotate-180 stroke-[3px]" />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-6">
                    <button className="w-12 h-12 bg-white/50 text-indigo-700 rounded-2xl flex items-center justify-center hover:bg-white hover:shadow-md transition-all">
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 flex-1 justify-center">
                    <button
                      onClick={() => {
                        setTrackProgress(0);
                        setCurrentLineIndex(Math.max(0, currentLineIndex - 1));
                      }}
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
                      onClick={() => {
                        setTrackProgress(0);
                        setCurrentLineIndex(
                          Math.min(script.length - 1, currentLineIndex + 1),
                        );
                      }}
                      className="w-14 h-14 bg-white text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-1 transition-all shadow-md"
                    >
                      <FastForward className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="w-12" />
                </>
              )}
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

        {/* Finish Button - Hidden when completed so user uses main CTA in player */}
        {!isCompleted && (
          <div className="mt-12 flex justify-center pb-20">
            <Link
              href={`/ai-reader/${id}`}
              className="bg-stone-300 text-stone-500 font-black px-12 py-4 rounded-2xl shadow-sm border-b-8 border-stone-400/50 uppercase tracking-widest text-sm opacity-50 cursor-not-allowed pointer-events-none"
            >
              Dengarkan sampai habis ✨
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
