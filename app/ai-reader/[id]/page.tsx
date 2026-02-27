import { FileText, Cpu, Clock } from "lucide-react";
import { adminDb } from "@/src/lib/firebase-admin";

export default async function AiReaderOverviewPage({
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl">
      <div className="bg-white border text-balance border-stone-200 rounded-xl p-8 md:p-12 shadow-sm">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 mb-6">
          Ringkasan Dokumen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-stone-50 rounded-lg p-5 border border-stone-100 flex items-start gap-4">
            <div className="bg-white p-2 rounded shadow-sm">
              <FileText className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1 tracking-wide">
                Halaman (Perkiraan)
              </p>
              <p className="font-serif text-xl font-bold text-stone-900">
                {pages}
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-5 border border-stone-100 flex items-start gap-4">
            <div className="bg-white p-2 rounded shadow-sm">
              <Cpu className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1 tracking-wide">
                Keyakinan AI
              </p>
              <p className="font-serif text-xl font-bold text-stone-900">
                {confidenceScore}%
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-5 border border-stone-100 flex items-start gap-4">
            <div className="bg-white p-2 rounded shadow-sm">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1 tracking-wide">
                Waktu Baca
              </p>
              <p className="font-serif text-xl font-bold text-stone-900">
                ~{readTime} mnt
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
            Konsep Utama
          </h3>
          <ul className="space-y-4">
            {concepts.map((concept: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold mt-0.5 border border-stone-200">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-medium text-stone-900">{concept}</p>
                </div>
              </li>
            ))}
            {concepts.length === 0 && (
              <p className="text-stone-500">Belum ada rincian konsep.</p>
            )}
          </ul>
          {metadata.summary && (
            <div className="mt-8 p-4 bg-stone-50 border border-stone-200 rounded-lg">
              <h4 className="font-medium text-stone-900 mb-2">
                Ringkasan Eksekutif
              </h4>
              <p className="text-stone-600 leading-relaxed">
                {metadata.summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
