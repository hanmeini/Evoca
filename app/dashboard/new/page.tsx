"use client";

import { PdfUploader } from "@/src/components/ui/PdfUploader";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function NewMissionPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-8">
        <div className="max-w-3xl mx-auto flex items-center gap-6">
          <Link
            href="/dashboard"
            className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-all shadow-sm"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3px]" />
          </Link>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] mb-1">
              Misi Baru
            </p>
            <h1 className="text-3xl font-black text-stone-900 leading-tight">
              Apa yang ingin kamu pelajari hari ini?
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white p-6 rounded-3xl border-2 border-stone-100 shadow-sm flex flex-col items-center text-center group hover:border-[#8b5cf6] transition-colors cursor-pointer">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-black text-sm text-stone-900 mb-1">
              Upload PDF
            </h3>
            <p className="text-[10px] font-bold text-stone-400 leading-relaxed uppercase tracking-tighter">
              Buku, Jurnal, atau Modul
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-stone-100 shadow-sm flex flex-col items-center text-center group hover:border-[#ffc800] transition-colors cursor-pointer">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="font-black text-sm text-stone-900 mb-1">
              Foto Materi
            </h3>
            <p className="text-[10px] font-bold text-stone-400 leading-relaxed uppercase tracking-tighter">
              Catatan atau Papan Tulis
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-stone-100 shadow-sm flex flex-col items-center text-center group hover:border-[#a78bfa] transition-colors cursor-pointer">
            <div className="w-14 h-14 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-black text-sm text-stone-900 mb-1">
              Cari Topik
            </h3>
            <p className="text-[10px] font-bold text-stone-400 leading-relaxed uppercase tracking-tighter">
              Ketik topik apa saja
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-stone-200 border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#ddd6fe] rounded-2xl flex items-center justify-center shadow-lg border-b-4 border-[#8b5cf6]">
              <Sparkles className="w-6 h-6 text-[#7c3aed]" />
            </div>
            <h2 className="text-xl font-black text-stone-900">
              Upload Materimu
            </h2>
          </div>

          <PdfUploader />

          <div className="mt-8 p-6 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="flex items-start gap-4">
              <div className="text-2xl mt-1">💡</div>
              <div>
                <h4 className="font-black text-xs text-stone-900 uppercase tracking-widest mb-1">
                  Tips Ahli
                </h4>
                <p className="text-sm font-medium text-stone-500 leading-relaxed">
                  Semakin jelas materi yang kamu berikan, semakin seru
                  petualangan belajar yang bisa EVOCA ciptakan untukmu!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
            Didukung oleh Kecerdasan Buatan & Semangat Belajarmu
          </p>
        </div>
      </div>
    </div>
  );
}
