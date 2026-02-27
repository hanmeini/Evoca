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
    <div className="h-[calc(100vh-140px)] flex flex-col container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden relative">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === "assistant" ? "" : "ml-auto flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 shrink-0 rounded-full flex items-center justify-center border",
                  m.role === "assistant"
                    ? "bg-stone-50 border-stone-200 text-stone-900"
                    : "bg-stone-900 border-stone-900 text-white",
                )}
              >
                {m.role === "assistant" ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              <div
                className={cn(
                  "rounded-2xl px-5 py-4",
                  m.role === "assistant"
                    ? "bg-stone-50 border border-stone-100/50"
                    : "bg-stone-900 text-stone-50",
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
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 shrink-0 rounded-full bg-stone-50 border border-stone-200 text-stone-900 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-stone-50 border border-stone-100/50 rounded-2xl px-5 py-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-100">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ajukan pertanyaan tentang dokumen..."
                className="w-full flex-1 rounded-full border border-stone-300 bg-white px-5 py-3.5 pr-14 text-sm font-medium text-stone-900 shadow-sm transition-colors placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 focus-visible:border-stone-950"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1.5 bottom-1.5 inline-flex aspect-square items-center justify-center rounded-full bg-stone-900 text-stone-50 transition-colors hover:bg-stone-800 disabled:pointer-events-none disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CornerDownLeft className="h-4 w-4" />
                )}
                <span className="sr-only">Kirim pesan</span>
              </button>
            </div>
          </form>
          <p className="text-center text-[11px] font-sans uppercase tracking-widest font-bold text-stone-400 mt-4">
            AI bisa membuat kesalahan. Verifikasi informasi penting.
          </p>
        </div>
      </div>
    </div>
  );
}
