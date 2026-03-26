import { FileText, Cpu, Clock, ChevronLeft, Sparkles } from "lucide-react";
import { adminDb } from "@/src/lib/firebase-admin";
import Link from "next/link";
import { SummaryFinishButton } from "@/src/components/reader/SummaryFinishButton";
import { cn } from "@/src/lib/utils";

export default async function AiReaderSummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ theme?: string }>;
}) {
  const { id } = await params;
  const { theme: themeParam } = await searchParams;

  // Theme palette matching PathNode THEMES
  const THEME_PALETTES: Record<string, { primary: string; light: string; border: string; lightBg: string; dot: string; badge: string }> = {
    evoca1: { primary: "#8b5cf6", light: "#ede9fe", border: "#c4b5fd", lightBg: "#f5f3ff", dot: "#a78bfa", badge: "bg-purple-50 text-purple-600 border-purple-100" },
    evoca2: { primary: "#6366f1", light: "#e0e7ff", border: "#a5b4fc", lightBg: "#eef2ff", dot: "#818cf8", badge: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    evoca3: { primary: "#3b82f6", light: "#dbeafe", border: "#93c5fd", lightBg: "#eff6ff", dot: "#60a5fa", badge: "bg-blue-50 text-blue-600 border-blue-100" },
    evoca4: { primary: "#d946ef", light: "#fce7f3", border: "#f0abfc", lightBg: "#fdf4ff", dot: "#e879f9", badge: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100" },
    evoca5: { primary: "#0ea5e9", light: "#e0f2fe", border: "#7dd3fc", lightBg: "#f0f9ff", dot: "#38bdf8", badge: "bg-sky-50 text-sky-600 border-sky-100" },
  };
  const t = THEME_PALETTES[themeParam || "evoca1"] || THEME_PALETTES["evoca1"];

  const docSnap = await adminDb.collection("documents").doc(id).get();
  const docData = docSnap.data() || {};
  const metadata = docData.metadata || {};

  const pages = Math.ceil((docData.extractedText?.length || 0) / 3000) || 1;
  const confidenceScore = metadata.confidenceScore || 95;
  const readTime = metadata.estimatedReadTimeMinutes || 10;
  const concepts = metadata.keyConcepts || [];
 
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*[\s\S]*?\*\*)/g);
    return parts.map((part: string, i: number) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold" style={{ color: t.primary, backgroundColor: t.light, paddingLeft: "4px", paddingRight: "4px", borderRadius: "4px" }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-stone-50/30">
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-4xl">
        <Link
          href={`/ai-reader/${id}`}
          className="inline-flex items-center gap-2 text-stone-400 hover:text-indigo-600 font-bold uppercase text-[10px] tracking-widest mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali
        </Link>

        {/* Main Clean Card */}
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-stone-200/60 overflow-hidden">
          {/* Header Area */}
          <div className="p-6 md:p-12 border-b border-stone-100 bg-white">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border mb-2" style={{ backgroundColor: t.light, color: t.primary, borderColor: t.border }}>
                <Sparkles className="w-3 h-3" />
                Ringkasan Materi
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-stone-900 leading-tight font-poppins">
                Jalur Penalaran: <span style={{ color: t.primary }}>{metadata.title || "Menguasai Materi"}</span>
              </h1>
              <p className="text-stone-500 font-medium text-base md:text-lg leading-relaxed">
                Eksplorasi poin-poin strategis untuk akselerasi pemahaman anda.
              </p>
            </div>
          </div>

          {/* Minimal Stats Row */}
          <div className="grid grid-cols-3 border-b border-stone-100 bg-stone-50/30">
            {[
              { label: "Halaman", value: pages, icon: FileText, color: "text-stone-400" },
              { label: "Akurasi", value: `${confidenceScore}%`, icon: Cpu, color: "text-emerald-500" },
              { label: "Estimasi", value: `${readTime}m`, icon: Clock, color: "text-amber-500" }
            ].map((stat, i: number) => (
              <div key={i} className="py-4 md:py-6 flex flex-col items-center justify-center border-r last:border-r-0 border-stone-100 gap-1">
                <stat.icon className={cn("w-4 h-4 mb-1", stat.color)} />
                <span className="text-lg md:text-xl font-black text-stone-800">{stat.value}</span>
                <span className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-tighter">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="p-6 md:p-12 space-y-12 md:space-y-20">
            {/* Core Summary Sections */}
            {metadata.summary && (
              <div className="space-y-12">
                {(() => {
                  const summary = metadata.summary || "";

                  const konteksMatch = summary.match(/KONTEKS:\s*([\s\S]*?)(?=INTI MATERI:|KESIMPULAN:|$)/i);
                  const intiMatch = summary.match(/INTI MATERI:\s*([\s\S]*?)(?=KESIMPULAN:|$)/i);
                  const kesimpulanMatch = summary.match(/KESIMPULAN:\s*([\s\S]*?)$/i);

                  const sections = [
                    { id: "konteks", title: "Konteks", content: konteksMatch ? konteksMatch[1].trim() : "", icon: "", theme: "blue" },
                    { id: "inti", title: "Inti Materi", content: intiMatch ? intiMatch[1].trim() : "", icon: "", theme: "indigo" },
                    { id: "kesimpulan", title: "Kesimpulan", content: kesimpulanMatch ? kesimpulanMatch[1].trim() : "", icon: "", theme: "emerald" }
                  ];

                  const hasNewFormat = sections.some(s => s.content.length > 0);

                  if (!hasNewFormat) {
                    return (
                      <div className="prose prose-stone max-w-none prose-p:text-stone-600 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg">
                        {summary.split('\n').map((line: string, i: number) => line.trim() && (
                          <p key={i} className="mb-6">{renderFormattedText(line)}</p>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-10">
                      {sections.map(section => section.content && (
                        <div key={section.id} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{section.icon}</span>
                            <h3 className="font-black text-stone-900 tracking-tight text-lg">{section.title}</h3>
                            <div className="h-px bg-stone-100 flex-1" />
                          </div>
                          
                          <div className={cn(
                            "rounded-2xl p-6 md:p-8 space-y-6 border",
                          )} style={{ backgroundColor: t.lightBg, borderColor: t.border }}>
                            {section.content.split('\n').map((line: string, i: number) => {
                              const trimmed = line.trim();
                              if (!trimmed) return null;

                              if (trimmed.startsWith('-')) {
                                return (
                                  <div key={i} className="flex gap-4 group/item">
                                    <div className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 transition-transform group-hover/item:scale-125" style={{ backgroundColor: t.dot }} />
                                    <p className="text-stone-600 leading-relaxed text-[15px] md:text-lg font-medium">
                                      {renderFormattedText(trimmed.replace(/^-/, '').trim())}
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <p key={i} className="text-stone-600 leading-relaxed text-[15px] md:text-lg font-medium pl-5" style={{ borderLeft: `2px solid ${t.border}` }}>
                                  {renderFormattedText(trimmed)}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Key Pillars - Minimal List */}
            {concepts.length > 0 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.3em]">Pilar-Pilar Utama</h3>
                  <p className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">Apa yang harus Anda kuasai</p>
                </div>

                <div className="grid gap-4">
                  {concepts.map((concept: string, idx: number) => {
                    const parts = concept.includes(':') ? concept.split(':') : [concept, ""];
                    return (
                      <div key={idx} className="flex gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border transition-all group" style={{ borderColor: t.border, backgroundColor: t.lightBg }}>
                        <div className="shrink-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl text-white flex items-center justify-center text-sm md:text-base font-black transition-colors" style={{ backgroundColor: t.primary }}>
                            {idx + 1}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-lg transition-colors" style={{ color: t.primary }}>
                            {renderFormattedText(parts[0].replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]/gu, '').trim())}
                          </h4>
                          {parts[1] && (
                            <p className="text-stone-500 text-sm md:text-base leading-relaxed font-medium">
                              {renderFormattedText(parts.slice(1).join(':').trim())}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-8 md:p-12 bg-stone-50/50 border-t border-stone-100 flex flex-col items-center gap-6 text-center">
            <div className="w-full max-w-xs scale-105 md:scale-110">
              <SummaryFinishButton
                documentId={id}
                initialCompleted={docData.completedStages?.includes("summary")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
