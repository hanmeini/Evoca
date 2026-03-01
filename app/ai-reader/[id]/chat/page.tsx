"use client";

import { useState, useRef, useEffect } from "react";
import { CornerDownLeft, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/src/lib/utils";

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
        "Halo! Saya telah membaca dokumen dengan teliti. Saya siap menjawab pertanyaan apa pun yang Anda miliki tentang isinya.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

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
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-4xl">
      <div className="bg-white border-2 border-stone-100 rounded-[2.5rem] shadow-2xl flex-1 flex flex-col overflow-hidden relative">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth no-scrollbar pb-32">
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
                  "w-12 h-12 shrink-0 rounded-[1.25rem] flex items-center justify-center shadow-sm",
                  m.role === "assistant"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-fuchsia-100 text-fuchsia-600",
                )}
              >
                {m.role === "assistant" ? (
                  <Bot className="w-6 h-6" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>

              <div
                className={cn(
                  "rounded-3xl px-6 py-4 shadow-sm relative",
                  m.role === "assistant"
                    ? "bg-stone-50 border border-stone-100/50 rounded-tl-sm"
                    : "bg-stone-900 text-white shadow-xl rounded-tr-sm",
                )}
              >
                <p
                  className={cn(
                    "leading-relaxed whitespace-pre-wrap",
                    m.role === "assistant"
                      ? "font-serif text-stone-800"
                      : "font-sans font-medium text-[15px]",
                  )}
                >
                  {m.content}
                </p>
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

          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 bg-transparent">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 max-w-3xl mx-auto bg-white/80 backdrop-blur-xl p-2 rounded-full border border-stone-200/50 shadow-2xl"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya Chatbot AI..."
                className="w-full flex-1 rounded-full bg-transparent px-6 py-4 text-[15px] font-medium text-stone-900 transition-colors placeholder:text-stone-400 focus-visible:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex aspect-square h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-stone-50 transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50 mr-1 shadow-md"
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
          <p className="text-center text-[10px] font-sans uppercase tracking-widest font-bold text-stone-400 mt-3 drop-shadow-sm">
            AI dapat melakukan kesalahan. Harap verifikasi info penting.
          </p>
        </div>
      </div>
    </div>
  );
}
