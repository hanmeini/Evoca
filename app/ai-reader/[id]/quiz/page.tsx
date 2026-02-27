"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

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

  const nextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-stone-900 animate-spin mb-4 mx-auto" />
        <p className="font-serif text-xl font-medium text-stone-900">
          Membuat Kuis AI...
        </p>
        <p className="text-stone-500 text-sm">
          Membaca dokumen dan merancang pertanyaan.
        </p>
      </div>
    );
  }

  if (error || quizData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <XCircle className="w-8 h-8 text-rose-600 mb-4 mx-auto" />
        <p className="font-serif text-xl font-medium text-stone-900 mb-2">
          Gagal Memuat Kuis
        </p>
        <p className="text-stone-500 text-sm max-w-sm mx-auto">
          {error || "AI tidak dapat membuat kuis dari teks ini."}
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="bg-white border border-stone-200 rounded-xl p-12 shadow-sm">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-stone-100 mb-6">
            <span className="font-serif text-3xl font-bold text-stone-900">
              {score}/{quizData.length}
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 mb-4">
            Kuis Selesai!
          </h2>
          <p className="text-stone-600 mb-8 max-w-sm mx-auto">
            Anda telah berhasil menyelesaikan kuis buatan AI untuk dokumen ini.
          </p>
          <button
            onClick={() => {
              setCurrentQuestion(0);
              setSelectedOption(null);
              setIsAnswered(false);
              setScore(0);
              setIsFinished(false);
            }}
            className="inline-flex h-10 items-center justify-center rounded-sm bg-stone-900 px-8 py-2 text-sm font-medium text-stone-50 shadow transition-colors hover:bg-stone-800"
          >
            Ulangi Kuis
          </button>
        </div>
      </div>
    );
  }

  const quiz = quizData[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="bg-white border border-stone-200 rounded-xl p-8 md:p-12 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Pertanyaan {currentQuestion + 1} dari {quizData.length}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Skor: {score}
          </span>
        </div>

        <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 mb-10 text-balance leading-snug">
          {quiz.question}
        </h2>

        <div className="space-y-3 mb-10">
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
                  "w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all",
                  !isAnswered &&
                    "border-stone-200 hover:border-stone-400 hover:bg-stone-50",
                  isSelected &&
                    !isAnswered &&
                    "border-stone-900 ring-1 ring-stone-900 bg-stone-50",
                  showCorrect &&
                    "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500",
                  showWrong &&
                    "border-rose-300 bg-rose-50 text-rose-900 opacity-80",
                  isAnswered &&
                    !isSelected &&
                    !isCorrect &&
                    "opacity-50 border-stone-200",
                )}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold",
                      showCorrect
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : showWrong
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "border-stone-200 bg-stone-50 text-stone-500",
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      showCorrect || showWrong
                        ? "text-inherit"
                        : "text-stone-700",
                    )}
                  >
                    {option}
                  </span>
                </div>

                {showCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                {showWrong && <XCircle className="w-5 h-5 text-rose-600" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={nextQuestion}
              className="inline-flex items-center justify-center rounded-sm bg-stone-900 px-6 py-2.5 text-sm font-medium text-stone-50 shadow transition-colors hover:bg-stone-800"
            >
              {currentQuestion < quizData.length - 1
                ? "Pertanyaan Berikutnya"
                : "Selesaikan Kuis"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
