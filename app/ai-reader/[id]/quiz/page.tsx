"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

type QuizItem = {
  question: string;
  options: string[];
  answerIndex: number;
};

import { use } from "react";

export default function AiReaderQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quizData, setQuizData] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadQuiz() {
      try {
        const response = await fetch(`/api/generate-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: id }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load quiz");

        if (data.quiz && data.quiz.length > 0) {
          setQuizData(data.quiz);
        } else {
          setError("No questions generated.");
        }
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuiz();
  }, [id]);

  const handleSelect = (index: number) => {
    if (isAnswered || quizData.length === 0) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === quizData[currentQuestion].answerIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (user) {
        try {
          const earnedXP = score * 10;
          setXpAwarded(earnedXP);
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: id, stage: "quiz", userId: user.uid, xpGained: earnedXP }),
          });
          router.refresh();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center animate-pulse">
        <div className="w-20 h-20 bg-[#F472B6] rounded-3xl flex items-center justify-center mb-6 shadow-xl border-4 border-white animate-bounce-slow">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <p className="font-serif text-2xl font-black text-stone-900 mb-2">
          Membuat Kuis AI...
        </p>
        <p className="text-stone-500 font-medium">
          Membaca dokumen dan merancang pertanyaan menantang.
        </p>
      </div>
    );
  }

  if (error || quizData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl border-4 border-white">
          <XCircle className="w-10 h-10 text-white" />
        </div>
        <p className="font-serif text-2xl font-black text-rose-950 mb-2">
          Gagal Memuat Kuis
        </p>
        <p className="text-rose-600/80 font-medium max-w-sm mx-auto">
          {error || "AI tidak dapat membuat kuis dari teks ini."}
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="bg-[#FEF3C7] border-4 border-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-300 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-50"></div>

          <div className="relative z-10">
            <div className="inline-flex justify-center flex-col items-center w-32 h-32 rounded-full border-4 border-white bg-amber-400 mb-8 shadow-xl text-amber-950 animate-bounce-slow">
              <Sparkles className="w-8 h-8 mb-1" />
              <span className="font-serif text-4xl font-black leading-none">
                {score}/{quizData.length}
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-amber-950 mb-4">
              Kuis Selesai!
            </h2>
            <p className="text-amber-800/80 font-bold mb-6 max-w-sm mx-auto text-lg leading-relaxed">
              Luar biasa! Anda telah menyelesaikan kuis ini.
            </p>

            {/* Gamification Success Badge */}
            <div className="flex justify-center mb-10">
              <div className="bg-[#ffc800] text-white px-5 py-2.5 rounded-2xl shadow-lg border-b-4 border-[#e5a500] flex items-center gap-3 transform scale-110 animate-in zoom-in duration-500">
                 <span className="text-xl">🎉</span>
                 <div className="flex flex-col items-start leading-none">
                   <p className="font-black uppercase tracking-widest text-[11px] text-amber-900 border-b border-amber-900/10 pb-1 mb-1 shadow-sm font-sans w-full text-left">Misi Selesai!</p>
                   <p className="font-bold text-[10px] text-amber-800 font-sans">+{xpAwarded} XP Diraih</p>
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setScore(0);
                  setIsFinished(false);
                }}
                className="inline-flex h-14 items-center justify-center rounded-full bg-stone-100 px-8 text-lg font-bold text-stone-900 shadow-sm transition-transform hover:-translate-y-1"
              >
                Coba Lagi
              </button>
              <Link
                href={`/ai-reader/${id}`}
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#58cc02] px-10 py-2 text-lg font-bold text-white shadow-xl transition-transform hover:-translate-y-1 border-b-8 border-[#46a302] active:border-b-0 active:translate-y-2 uppercase tracking-widest"
              >
                Lanjut ke Peta ✨
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quiz = quizData[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href={`/ai-reader/${id}`}
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-black uppercase text-xs tracking-widest mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 stroke-[3px]" />
        Kembali ke Jalur Belajar
      </Link>

      <div className="bg-white border-2 border-stone-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-stone-200/50">
        <div className="flex items-center justify-between mb-8">
          <div className="bg-stone-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-stone-500 shadow-inner">
            Q {currentQuestion + 1} / {quizData.length}
          </div>
          <div className="bg-[#A78BFA] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
            Skor: {score}
          </div>
        </div>

        <h2 className="font-serif text-2xl md:text-3xl font-black tracking-tight text-stone-900 mb-10 text-balance leading-snug">
          {quiz.question}
        </h2>

        <div className="space-y-4 mb-10">
          {quiz.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === quiz.answerIndex;
            const showCorrect = isAnswered && isCorrect;
            const showWrong = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all duration-300 transform",
                  !isAnswered &&
                    "border-stone-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:-translate-y-1 hover:shadow-md",
                  isSelected &&
                    !isAnswered &&
                    "border-indigo-600 bg-indigo-50 shadow-md",
                  showCorrect &&
                    "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-lg scale-[1.02]",
                  showWrong &&
                    "border-rose-300 bg-rose-50 text-rose-950 opacity-90 scale-[0.98]",
                  isAnswered &&
                    !isSelected &&
                    !isCorrect &&
                    "opacity-50 border-stone-100 grayscale",
                )}
              >
                <div className="flex items-center gap-5">
                  <span
                    className={cn(
                      "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-inner transition-colors",
                      showCorrect
                        ? "bg-emerald-500 text-white"
                        : showWrong
                          ? "bg-rose-500 text-white"
                          : isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-stone-100 text-stone-600",
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span
                    className={cn(
                      "font-bold text-[15px] leading-relaxed",
                      showCorrect || showWrong
                        ? "text-inherit"
                        : "text-stone-700",
                    )}
                  >
                    {option}
                  </span>
                </div>

                {showCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                )}
                {showWrong && (
                  <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={nextQuestion}
              className="inline-flex h-14 items-center justify-center rounded-full bg-stone-900 px-8 text-sm font-bold text-white shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl"
            >
              {currentQuestion < quizData.length - 1
                ? "Pertanyaan Berikutnya"
                : "Lihat Hasil"}
              <ArrowRight className="ml-3 w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
