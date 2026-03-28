"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronLeft,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

type QuizItem = {
  question: string;
  options: string[];
  answerIndex: number;
};

import { use } from "react";
import { useSearchParams } from "next/navigation";

export default function AiReaderQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const [quizData, setQuizData] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [isAlreadyFinishedQuiz, setIsAlreadyFinishedQuiz] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadQuiz() {
      if (!id || !user?.uid) return;
      try {
        const response = await fetch(`/api/generate-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            documentId: id, 
            userId: user.uid
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load quiz");

        if (data.quiz && data.quiz.length > 0) {
          setQuizData(data.quiz);
          
          // Check if already finished
          const docRes = await fetch(`/api/document/${id}`);
          const docData = await docRes.json();
          if (docData.success && docData.data?.completedStages?.includes("quiz")) {
            setIsFinished(true);
            setIsAlreadyFinishedQuiz(true);
            setScore(docData.data.quizScore || 0); 
          }
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
  }, [id, user]);

  const handleSelect = (index: number) => {
    if (isAnswered || quizData.length === 0) return;
    setSelectedOption(index);
    setIsAnswered(true);
    const isCorrect = index === quizData[currentQuestion].answerIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    // Store last answer correctness for final score calculation
    (handleSelect as any)._lastCorrect = isCorrect;
  };

  const nextQuestion = async (lastAnswerCorrect?: boolean) => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Calculate final score accurately using the lastAnswerCorrect flag
      // to avoid asynchronous state issues at the end of the quiz
      const finalScore = lastAnswerCorrect ? score + 1 : score;
      
      setIsFinished(true);
      if (user) {
        try {
          const earnedXP = finalScore * 20;
          setXpAwarded(earnedXP);
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              documentId: id, 
              stage: "quiz", 
              userId: user.uid, 
              xpGained: earnedXP,
              score: finalScore,
              total: quizData.length
            }),
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
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-4 bg-[#fff8f0]">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-4 shadow-2xl border-b-8 border-pink-400 bg-[#F472B6] animate-bounce">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-pink-200/50 rounded-full blur-md" />
        </div>
        <p className="font-black text-2xl text-stone-900 mb-1 uppercase tracking-tight">
          Membuat Kuis AI...
        </p>
        <p className="text-stone-500 font-medium max-w-sm">
          AI sedang merancang pertanyaan menantang dari materimu.
        </p>
        <div className="flex gap-2 mt-6">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
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
    const activeMascot = user?.uid ? (localStorage.getItem('selectedMascot') || 'tiger') : 'tiger';
    const mascotImage = `/pet/${activeMascot}/young.png`;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-b from-[#FFFBEB] to-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-2xl bg-white rounded-[3rem] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(251,191,36,0.2)] border-2 border-amber-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-amber-400 via-yellow-300 to-amber-400" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-50 rounded-full blur-3xl opacity-60" />

          {/* Mascot Success Image */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-40 h-40 md:w-56 md:h-56 relative mb-8"
          >
            <img 
              src={mascotImage} 
              alt="Mascot Congrats" 
              className="w-full h-full object-contain animate-bounce-slow"
              onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.ico' }}
            />
            {/* Celebration Sparkles */}
            <div className="absolute -top-4 -right-4 text-4xl animate-pulse">✨</div>
            <div className="absolute -bottom-4 -left-4 text-4xl animate-pulse [animation-delay:0.5s]">🌟</div>
          </motion.div>

          <header className="mb-10 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-amber-950 uppercase tracking-tight mb-3">
              Kuis Selesai!
            </h2>
            <p className="text-amber-800/60 font-bold text-lg max-w-sm mx-auto">
              Luar biasa! Pengetahuanmu tentang materi ini meningkat pesat.
            </p>
          </header>

          <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-12">
            <div className="bg-amber-50/50 rounded-3xl p-6 border-2 border-amber-100/50 shadow-inner">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Skor Kuis</p>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-3xl font-black text-amber-950">{score}/{quizData.length}</span>
              </div>
            </div>
            <div className="bg-indigo-50/50 rounded-3xl p-6 border-2 border-indigo-100/50 shadow-inner">
               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">XP Didapat</p>
               <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                <span className="text-3xl font-black text-indigo-950">+{score * 20}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setScore(0);
                setIsFinished(false);
              }}
              className="w-full sm:flex-1 h-16 bg-stone-100 border-b-4 border-stone-200 text-stone-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-stone-200 transition-all active:border-b-0 active:translate-y-1"
            >
              Coba Lagi
            </button>
            <Link
              href={`/ai-reader/${id}/podcast${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
              className="w-full sm:flex-1 h-16 bg-[#58cc02] border-b-4 border-[#46a302] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:border-b-0 active:translate-y-1"
            >
              BERIKUTNYA <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const quiz = quizData[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start md:pt-16 pt-8 px-4 py-4 overflow-hidden bg-white">
      <div className="w-full max-w-5xl">
        <Link
          href={`/ai-reader/${id}`}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-black uppercase text-[10px] tracking-widest mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          Kembali ke Jalur Belajar
        </Link>

      <div className="w-full max-w-5xl relative">
        
        <div className="bg-white border-2 border-stone-100 rounded-[2rem] p-5 md:p-8 shadow-2xl shadow-stone-200/40 relative z-10 border-b-8 border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-stone-100 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-stone-500 shadow-inner">
              Q {currentQuestion + 1} / {quizData.length}
            </div>
            <div className="bg-[#A78BFA] text-white px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-md">
              Skor: {score}
            </div>
          </div>

          <h2 className="font-serif text-lg md:text-xl font-black tracking-tight text-stone-900 mb-4 leading-snug">
            {quiz.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
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
                    "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-300 transform",
                    !isAnswered &&
                    "border-stone-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm",
                    isSelected &&
                    !isAnswered &&
                    "border-indigo-600 bg-indigo-50 shadow-sm",
                    showCorrect &&
                    "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md",
                    showWrong &&
                    "border-rose-300 bg-rose-50 text-rose-950 opacity-90",
                    isAnswered &&
                    !isSelected &&
                    !isCorrect &&
                    "opacity-50 border-stone-100 grayscale",
                  )}
                >
                  <div className="flex items-center gap-5">
                    <span
                      className={cn(
                        "shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-black shadow-inner transition-colors",
                        showCorrect
                          ? "bg-emerald-500 text-white"
                          : showWrong
                            ? "bg-rose-500 text-white"
                            : isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-stone-50 text-stone-400",
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span
                      className={cn(
                        "font-bold text-xs md:text-[13px] leading-relaxed",
                        showCorrect || showWrong
                          ? "text-inherit"
                          : "text-stone-500",
                      )}
                    >
                      {option}
                    </span>
                  </div>

                  {showCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {showWrong && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => nextQuestion((handleSelect as any)._lastCorrect)}
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
    </div>
  </div>
  );
}

