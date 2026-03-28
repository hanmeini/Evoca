"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Volume2,
  Loader2,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Headphones,
  Sparkles,
  ArrowLeft,
  Music,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type ScriptLine = {
  speaker: "A" | "B";
  text: string;
};

// Simplified and Reactive Waveform
const ReactiveWaveform = ({ freqData, isPlaying }: { freqData: number[], isPlaying: boolean }) => {
  return (
    <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-28 sm:h-32 w-full mb-4 sm:mb-6">
      {freqData.map((val, i) => {
        // Center-weighted mapping for mountain shape
        const mid = 20;
        const dist = Math.abs(mid - i);
        const sensitivity = Math.max(0.1, 1 - (dist * 0.04));
        // Use raw frequency data for heights
        const height = isPlaying ? Math.max(10, val * sensitivity * 0.6) : 10;

        return (
          <motion.div
            key={i}
            animate={{ height, opacity: isPlaying ? 1 : 0.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "w-2 sm:w-3 rounded-full bg-gradient-to-t from-purple-500 to-indigo-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]",
              i < 8 || i > 32 ? "hidden xs:block" : ""
            )}
          />
        );
      })}
    </div>
  );
};

export default function AiReaderPodcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme") || "evoca1";

  const THEME_PALETTES: Record<string, { primary: string; light: string; border: string; bgPage: string; glow: string }> = {
    evoca1: { primary: "#8b5cf6", light: "#ede9fe", border: "#c4b5fd", bgPage: "#f5f3ff", glow: "rgba(139,92,246,0.3)" },
    evoca2: { primary: "#6366f1", light: "#e0e7ff", border: "#a5b4fc", bgPage: "#eef2ff", glow: "rgba(99,102,241,0.3)" },
    evoca3: { primary: "#3b82f6", light: "#dbeafe", border: "#93c5fd", bgPage: "#eff6ff", glow: "rgba(59,130,246,0.3)" },
    evoca4: { primary: "#d946ef", light: "#fce7f3", border: "#f0abfc", bgPage: "#fdf4ff", glow: "rgba(217,70,239,0.3)" },
    evoca5: { primary: "#0ea5e9", light: "#e0f2fe", border: "#7dd3fc", bgPage: "#f0f9ff", glow: "rgba(14,165,233,0.3)" },
  };
  const t = THEME_PALETTES[themeParam] || THEME_PALETTES["evoca1"];

  const [isPlaying, setIsPlaying] = useState(false);
  const [script, setScript] = useState<ScriptLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [trackProgress, setTrackProgress] = useState(0);

  // Audio Analysis Setup
  const [freqData, setFreqData] = useState<number[]>(new Array(40).fill(10));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // States for completion
  const [isAlreadyFinishedPodcast, setIsAlreadyFinishedPodcast] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const audioCache = useRef<Record<number, string>>({});
  const fetchPromises = useRef<Record<number, Promise<string | null>>>({});

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const lineDuration = 8;
  const currentTime = Math.floor((currentLineIndex + trackProgress) * lineDuration);
  const totalDuration = script.length * lineDuration;

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
        
        if (!response.ok) throw new Error(`HTTP ${response.status} while preloading line ${index}`);
        
        const blob = await response.blob();
        
        // 1. CEK VALIDITAS CACHE (Blob Inspection)
        console.log(`[Audio Data Check] Line ${index}:`, {
           type: blob.type,
           size: blob.size,
           isValid: blob.size > 100 // Minimal size for valid MP3 headers
        });

        if (blob.size < 100) {
          throw new Error(`Potongan audio baris ${index} kosong atau corrupt.`);
        }

        const url = URL.createObjectURL(blob);
        audioCache.current[index] = url;
        return url;
      } catch (err) {
        console.error("DETAIL AUDIO ERROR (Preload):", err);
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
          const docRes = await fetch(`/api/document/${id}`);
          const docData = await docRes.json();
          if (docData.success && docData.data?.completedStages?.includes("podcast")) {
            setIsAlreadyFinishedPodcast(true);
          }
        } else {
          setError("No script generated.");
        }
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }

    loadPodcast();
  }, [id]);

  // Audio Analysis Loop
  useEffect(() => {
    if (!isPlaying || !audioRef.current) {
      setFreqData(new Array(40).fill(10));
      return;
    }

    const startAnalysis = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount) as Uint8Array<ArrayBuffer>;

        if (audioRef.current) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }
      }

      const updateAnalysis = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const raw = Array.from(dataArrayRef.current).slice(0, 40);
          setFreqData(raw);
        }
        animationRef.current = requestAnimationFrame(updateAnalysis);
      };

      updateAnalysis();
    };

    startAnalysis();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    const playCurrentLine = async () => {
      // 1. Guard check before starting
      if (!isPlaying || !script.length) return;

      if (currentLineIndex >= script.length) {
        setIsPlaying(false);
        setCurrentLineIndex(0);
        return;
      }

      try {
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        // 2. Fetch from cache or server
        let audioUrl = await preloadAudio(currentLineIndex, script);
        
        // 3. VALIDITAS CACHE check
        console.log(`[Cache Check] Line ${currentLineIndex}:`, audioUrl ? "URL Present" : "URL MISSING");

        // 4. FALLBACK: If missing, clear and re-fetch ONCE
        if (!audioUrl) {
          console.warn(`[Fallback] Audio for line ${currentLineIndex} missing. Re-fetching...`);
          delete audioCache.current[currentLineIndex];
          delete fetchPromises.current[currentLineIndex];
          audioUrl = await preloadAudio(currentLineIndex, script);
        }

        if (!isPlaying || !audioRef.current) return;
        
        if (!audioUrl) {
          console.error("DETAIL AUDIO ERROR: Failed joining cached audio after fallback.");
          throw new Error("Failed joining cached audio.");
        }

        audioRef.current.src = audioUrl;
        
        audioRef.current.onended = () => {
          setTrackProgress(0);
          if (currentLineIndex >= script.length - 1) {
            setIsPlaying(false);
            if (!isAlreadyFinishedPodcast) {
              setIsAlreadyFinishedPodcast(true);
              setShowCompletionPopup(true);
              fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: id, stage: "podcast", userId: user?.uid, xpGained: 50 }),
              }).then(() => router.refresh());
            }
          } else {
            setTimeout(() => {
              if (isPlaying) setCurrentLineIndex(prev => prev + 1);
            }, 400);
          }
        };

        audioRef.current.ontimeupdate = () => {
          if (audioRef.current && audioRef.current.duration) {
            setTrackProgress(audioRef.current.currentTime / audioRef.current.duration);
          }
        };

        // 5. TRY-CATCH PLAYBACK
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
             await playPromise;
          }
        } catch (playErr) {
          console.error("DETAIL AUDIO ERROR during .play():", playErr);
          throw playErr;
        }

        preloadAudio(currentLineIndex + 1, script);
        preloadAudio(currentLineIndex + 2, script);
      } catch (err) {
        console.error("DETAIL AUDIO ERROR (Critical):", err);
        if (isPlaying) {
          setTimeout(() => setCurrentLineIndex(prev => prev + 1), 1000);
        }
      }
    };

    playCurrentLine();
  }, [isPlaying, currentLineIndex, script, isAlreadyFinishedPodcast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6ff] flex flex-col items-center justify-center text-center p-6 gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full bg-stone-950 shadow-2xl ring-4 ring-purple-300 relative flex items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full" style={{ background: 'repeating-conic-gradient(#1c1917 0deg, #292524 10deg, #1c1917 20deg)' }} />
          <div className="w-12 h-12 rounded-full bg-purple-600 z-10 flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
        </motion.div>
        <div>
          <h2 className="text-stone-900 font-black text-xl uppercase tracking-tight">Menyiapkan Podcast...</h2>
          <p className="text-stone-400 font-medium text-sm mt-1">Sedang menyusun skrip AI</p>
        </div>
      </div>
    );
  }

  if (error || script.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-stone-900 text-2xl font-black font-poppins">Gagal Memuat Podcast</h2>
        <p className="text-stone-600 font-medium">{error || "Silakan coba lagi nanti."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6ff] py-8 sm:py-16 px-4 flex flex-col items-center relative overflow-hidden font-sans">
      <audio ref={audioRef} crossOrigin="anonymous" hidden />

      {/* Ambient Bacgkround Blobs */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: t.glow }} />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" style={{ backgroundColor: t.glow }} />


      <div className="max-w-xl w-full relative z-10">
        <div className="mb-4">
          <Link
            href={`/ai-reader/${id}?theme=${themeParam}`}
            className="group inline-flex items-center gap-2 text-stone-500 font-black text-xs uppercase tracking-widest transition-all hover:opacity-80"
            style={{ color: t.primary }}
          >
            <ArrowLeft className="w-4 h-4 stroke-[3px]" />
            Kembali
          </Link>
        </div>

        {/* Compact Card Player */}
        <div className="bg-white/90 backdrop-blur-md border-[4px] border-white rounded-[2.5rem] p-6 sm:px-8 sm:py-10 shadow-xl relative overflow-hidden">

          <div className="flex flex-col items-center">

            {/* Vinyl Record */}
            <div className="relative mb-6">
              <motion.div
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={isPlaying ? { duration: 10, repeat: Infinity, ease: "linear" } : { duration: 0.8 }}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full shadow-2xl relative z-10 overflow-hidden ring-4 ring-white/50"
              >
                <div className="w-full h-full bg-stone-950 flex items-center justify-center relative">
                  <Image src="/vinyl_record.png" alt="Vinyl" fill className="object-cover opacity-80" />
                  <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full z-20 flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: t.primary }}>
                    <Music className="w-6 h-6 sm:w-7 sm:h-7 text-white/90" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Info Text */}
            <div className="text-center mb-6">
              {isAlreadyFinishedPodcast && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-emerald-100" style={{ backgroundColor: t.bgPage, color: t.primary, borderColor: t.border }}>
                  <Zap className="w-3 h-3 fill-current" /> Misi Selesai
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl font-black text-indigo-950 font-poppins tracking-tighter uppercase leading-none">
                Podcast Player
              </h2>
            </div>

            {/* Reactive Voice Waveform */}
            <div className="w-full px-2 mb-4">
              <ReactiveWaveform freqData={freqData} isPlaying={isPlaying} />

              {/* Traditional Progress Bar restored below the waveform */}
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-3 border border-white">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: t.primary, width: `${((currentLineIndex + trackProgress) / Math.max(script.length, 1)) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-black text-stone-400 tracking-widest font-sans px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Single Row Controls */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 w-full mt-4">
              <button
                onClick={() => { setTrackProgress(0); setCurrentLineIndex(Math.max(0, currentLineIndex - 1)); }}
                className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center hover:bg-stone-100 transition-all border border-stone-200"
              >
                <Rewind className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-all border-[8px] border-white focus-visible:outline-none focus-visible:ring-4"
                style={{ backgroundColor: t.primary }}
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
              </button>

              <button
                onClick={() => { setTrackProgress(0); setCurrentLineIndex(Math.min(script.length - 1, currentLineIndex + 1)); }}
                className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center hover:bg-stone-100 transition-all border border-stone-200"
              >
                <FastForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Script Preview */}
        <div className="mt-10 max-w-xl mx-auto pb-48 px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6 text-center">📜 Transkrip Podcast</h3>
          <div className="space-y-4">
            {script.map((line, idx) => {
              const isActive = currentLineIndex === idx;
              return (
                <motion.div
                  key={idx}
                  className={cn(
                    "flex gap-4 p-5 rounded-3xl transition-all duration-300",
                    isActive ? "bg-white shadow-xl border border-stone-100" : "bg-transparent opacity-40 grayscale"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black shrink-0",
                    line.speaker === "A" ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {line.speaker}
                  </div>
                  <p className={cn(
                    "leading-relaxed transition-all pt-0.5",
                    isActive ? "font-bold text-stone-900 text-base" : "font-medium text-stone-500 text-sm"
                  )}>
                    {line.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion Popup - Full Screen Centered Modal with Theme */}
      <AnimatePresence>
        {showCompletionPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: `${t.primary}25` }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full text-center relative overflow-hidden border-4"
              style={{ borderColor: t.border }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-20" style={{ backgroundColor: t.primary }} />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl border-b-8"
                  style={{ backgroundColor: t.primary, borderColor: `${t.primary}90` }}
                >
                  <Zap className="w-12 h-12 text-white fill-white" />
                </motion.div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tight text-stone-900">Podcast Selesai!</h3>
                  <div className="flex items-center justify-center gap-2 mt-2" style={{ color: t.primary }}>
                    <Zap className="w-4 h-4 fill-current" />
                    <p className="text-sm font-black">+50 XP Berhasil Ditambahkan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCompletionPopup(false);
                    router.push(`/ai-reader/${id}?theme=${themeParam}`);
                  }}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all active:scale-95 border-b-4 shadow-lg"
                  style={{ backgroundColor: t.primary, borderColor: `${t.primary}90` }}
                >
                  Oke, Lanjutkan! →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
