"use client";

import { useState, useRef, useEffect } from "react";
import { CornerDownLeft, Loader2, Bot, User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

import { use } from "react";

export default function AiReaderChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Halo! Saya telah membaca dokumen dengan teliti.\n\nSaya siap membantu Anda **memahami poin-poin penting**, **menjawab pertanyaan teknis**, atau sekadar **berdiskusi** tentang isinya. Apa yang ingin Anda tanyakan?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [docTitle, setDocTitle] = useState<string>("Chat AI");
  const [isAlreadyFinished, setIsAlreadyFinished] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchChatHistory() {
      try {
        const response = await fetch(`/api/chat-history?documentId=${id}`);
        const data = await response.json();
        if (data.success && data.chatHistory && data.chatHistory.length > 0) {
          setMessages(
            data.chatHistory.map(
              (
                m: { role: "user" | "assistant"; content: string },
                i: number,
              ) => ({
                id: `hist-${i}`,
                role: m.role,
                content: m.content,
              }),
            ),
          );
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }

    async function fetchDocDetails() {
      try {
        const res = await fetch(`/api/document/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setDocTitle(data.data.metadata?.title || data.data.fileName || "Chat AI");
          setIsAlreadyFinished(data.data.completedStages?.includes("chat") || false);
        }
      } catch (err) {
        console.error("Error fetching doc details:", err);
      }
    }


    fetchDocDetails();
    fetchChatHistory();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    // Optimistic UI update
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: id,
          currentMessages: updatedMessages.filter((m) => m.id !== "1"), // don't send welcoming message
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal menghasilkan balasan");

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err: unknown) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Maaf, saya menemui kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(true); // temporary state to wait for tracker
      // Track mission progress
      if (user) {
        fetch("/api/mission-track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, type: "message" }),
        }).catch(e => console.error("Mission track failed:", e));
      }
      setIsLoading(false);
    }
  };

  const handleFinishMission = async () => {
    if (!user || isFinishing) return;
    setIsFinishing(true);

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: id,
          stage: "chat",
          userId: user.uid,
          xpGained: 50
        }),
      });

      setShowSuccess(true);

      // Smooth transition delay
      setTimeout(() => {
        router.push(`/dashboard?completed=true&questId=${id}`);
        router.refresh();
      }, 2500);
    } catch (error) {
      console.error("Failed to finish mission:", error);
      setIsFinishing(false);
    }
  };

  return (
    <div className="fixed inset-0 md:relative md:h-[calc(100vh-120px)] flex flex-col bg-[#f7f7f7] md:bg-transparent z-[60] md:z-0">
      <div className="flex flex-col h-full container mx-auto px-0 md:px-6 lg:px-8 py-0 md:py-4 max-w-6xl">
        {/* Sticky Professional Header */}
        <header className="bg-white/80 backdrop-blur-md md:bg-transparent border-b md:border-none border-stone-100 p-4 md:p-0 md:mb-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              href={`/ai-reader/${id}`}
              className="w-10 h-10 md:w-auto md:h-auto flex items-center justify-center rounded-xl bg-stone-100 md:bg-transparent text-stone-500 hover:text-stone-900 transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5 md:w-4 md:h-4 stroke-[3px]" />
            </Link>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-sm md:text-xl font-black text-stone-900 truncate uppercase tracking-tight italic">
                Diskusi Materi
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100 flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">+50 XP</span>
            </div>
          </div>
        </header>

        <div className="bg-white border-t-2 md:border-2 border-stone-100 rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl flex-1 flex flex-col overflow-hidden relative">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth no-scrollbar pb-32 md:pb-30">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-4 max-w-[85%] md:max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  m.role === "assistant" ? "" : "ml-auto flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-[1rem] md:rounded-[1.25rem] flex items-center justify-center shadow-sm",
                    m.role === "assistant"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-fuchsia-100 text-fuchsia-600",
                  )}
                >
                  {m.role === "assistant" ? (
                    <Bot className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-[1.5rem] md:rounded-[2rem] px-5 py-3 md:px-6 md:py-5 shadow-sm relative transition-all",
                    m.role === "assistant"
                      ? "bg-white border-2 border-stone-100 text-stone-800 rounded-tl-lg"
                      : "bg-indigo-600 text-white shadow-indigo-100 shadow-xl rounded-tr-lg",
                  )}
                >
                  <div
                    className={cn(
                      "text-[14px] md:text-[15px] font-sans",
                      m.role === "assistant" ? "font-medium" : "font-semibold"
                    )}
                  >
                    <FormattedMessage
                      content={m.content}
                      isAssistant={m.role === "assistant"}
                    />
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-12 h-12 shrink-0 rounded-[1.25rem] bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="bg-stone-50 border border-stone-100/50 rounded-3xl rounded-tl-sm px-6 py-4 flex items-center gap-2 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}

            {(messages.length >= 7 || isAlreadyFinished) && (
              <div className="flex justify-center pt-8 pb-4">
                <button
                  onClick={handleFinishMission}
                  disabled={isFinishing || isAlreadyFinished}
                  className={cn(
                    "font-black px-12 py-4 rounded-2xl shadow-lg border-b-8 uppercase tracking-widest text-sm flex items-center gap-2 group relative overflow-hidden transition-all",
                    isAlreadyFinished 
                      ? "bg-stone-200 text-stone-500 border-stone-300 cursor-not-allowed transform-none shadow-none border-b-4 translate-y-1"
                      : "bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302] active:border-b-0 active:translate-y-2"
                  )}
                >
                  {isFinishing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isAlreadyFinished ? (
                    <>Misi Sudah Selesai ✅</>
                  ) : (
                    <>Selesaikan Misi ✨</>
                  )}
                </button>
              </div>
            )}

            <div ref={bottomRef} className="h-2" />
          </div>

          {/* Full screen smooth transition success overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-32 h-32 bg-[#ffc800] rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8 border-b-8 border-[#e5a500]"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <Bot className="w-16 h-16 text-white" />
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-black text-stone-900 mb-2 uppercase tracking-tight"
                >
                  Misi Selesai!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#8b5cf6] font-black text-xl mb-8"
                >
                  +50 XP Berhasil Diraih
                </motion.p>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 1.5 }}
                  className="w-48 h-2 bg-stone-100 rounded-full overflow-hidden"
                >
                  <div className="h-full bg-[#58cc02] w-full" />
                </motion.div>
                <p className="mt-4 text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">
                  Kembali ke Peta Misi...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 md:p-8 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 md:pt-16">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 max-w-4xl mx-auto bg-white p-1.5 rounded-2xl md:rounded-full border-2 border-stone-100 shadow-2xl"
            >
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanya Chatbot AI..."
                  className="w-full flex-1 rounded-full bg-transparent px-4 md:px-6 py-3 md:py-4 text-[14px] md:text-[15px] font-medium text-stone-900 transition-colors placeholder:text-stone-400 focus-visible:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="inline-flex aspect-square h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-full bg-indigo-600 text-white transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50 mr-1 shadow-md shadow-indigo-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CornerDownLeft className="h-5 w-5" />
                  )}
                  <span className="sr-only">Kirim pesan</span>
                </button>
              </div>
            </form>
            <p className="hidden md:block text-center text-[10px] font-sans uppercase tracking-[0.2em] font-black text-stone-300 mt-4 md:mt-3">
              AI dapat melakukan kesalahan • Verifikasi info penting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormattedMessage({ content, isAssistant }: { content: string, isAssistant: boolean }) {
  const renderText = (text: string) => {
    // Bold logic with regex for **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={i}
            className={cn(
              "font-black tracking-tight",
              isAssistant ? "text-indigo-600" : "text-white underline decoration-white/30"
            )}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      {content.split('\n\n').map((block, bIdx) => {
        const lines = block.split('\n');
        return (
          <div key={bIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              const isListItem = trimmed.startsWith('- ') || trimmed.startsWith('• ') || /^\d+\./.test(trimmed);

              if (isListItem) {
                return (
                  <div key={lIdx} className="flex gap-3 items-start ml-1 group/item">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 transition-transform group-hover/item:scale-125",
                        isAssistant ? "bg-indigo-400" : "bg-white/60"
                      )}
                    />
                    <span className="flex-1 leading-relaxed">{renderText(line.trim().replace(/^[-•]\s*|^\d+\.\s*/, ''))}</span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="leading-relaxed opacity-[0.98]">
                  {renderText(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
