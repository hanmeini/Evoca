import { FileText, Cpu, Clock, ChevronLeft } from "lucide-react";
import { adminDb } from "@/src/lib/firebase-admin";
import Link from "next/link";

export default async function AiReaderSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const docSnap = await adminDb.collection("documents").doc(id).get();
  const docData = docSnap.data() || {};
  const metadata = docData.metadata || {};

  const pages = Math.ceil((docData.extractedText?.length || 0) / 3000) || 1;
  const confidenceScore = metadata.confidenceScore || 95;
  const readTime = metadata.estimatedReadTimeMinutes || 10;
  const concepts = metadata.keyConcepts || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      <Link
        href={`/ai-reader/${id}`}
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-black uppercase text-xs tracking-widest mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 stroke-[3px]" />
        Kembali ke Jalur Belajar
      </Link>

      <div className="bg-white border text-balance border-stone-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-stone-200/50">
        <h2 className="font-serif text-3xl font-black tracking-tight text-stone-900 mb-8">
          Tahap 1: Ringkasan Materi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-[#FFE4E6] rounded-3xl p-6 shadow-sm border border-white hover:-translate-y-1 transition-transform flex items-start gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm text-rose-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 mb-1 uppercase tracking-widest">
                Halaman
              </p>
              <p className="font-serif text-2xl font-black text-rose-950">
                {pages}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#E0E7FF] rounded-3xl p-6 shadow-sm border border-white hover:-translate-y-1 transition-transform flex items-start gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-500">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 mb-1 uppercase tracking-widest">
                Keyakinan AI
              </p>
              <p className="font-serif text-2xl font-black text-indigo-950">
                {confidenceScore}%
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#D1FAE5] rounded-3xl p-6 shadow-sm border border-white hover:-translate-y-1 transition-transform flex items-start gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 mb-1 uppercase tracking-widest">
                Waktu Baca
              </p>
              <p className="font-serif text-2xl font-black text-emerald-950">
                ~{readTime} mnt
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl font-black text-stone-900 mb-6">
            Konsep Utama
          </h3>
          <ul className="space-y-4">
            {concepts.map((concept: string, idx: number) => (
              <li
                key={idx}
                className="flex items-start gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 hover:bg-stone-100 transition-colors"
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {idx + 1}
                </span>
                <div className="pt-1">
                  <p className="font-bold text-stone-900 leading-tight">
                    {concept}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {metadata.summary && (
            <div className="mt-10 p-8 bg-[#FEF3C7] border border-white rounded-[2rem] shadow-sm">
              <h4 className="font-serif text-xl font-black text-amber-950 mb-4">
                Ringkasan Eksekutif
              </h4>
              <p className="text-stone-800 leading-relaxed font-medium">
                {metadata.summary}
              </p>
            </div>
          )}
        </div>

        {/* Start Mission Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href={`/ai-reader/${id}`}
            className="bg-[#58cc02] text-white font-black px-12 py-4 rounded-2xl shadow-lg border-b-8 border-[#46a302] active:border-b-0 active:translate-y-2 transition-all uppercase tracking-widest text-sm"
          >
            Selesaikan Tahap 1 ✨
          </Link>
        </div>
      </div>
    </div>
  );
}
