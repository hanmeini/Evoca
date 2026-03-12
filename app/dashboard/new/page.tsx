"use client";

import { useState } from "react";
import { PdfUploader } from "@/src/components/ui/PdfUploader";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Search,
  Camera,
  UploadCloud,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export default function NewMissionPage() {
  const [activeTab, setActiveTab] = useState<"pdf" | "photo" | "search">("pdf");

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
          {/* Tab: PDF */}
          <div 
            onClick={() => setActiveTab("pdf")}
            className={cn(
              "p-6 rounded-3xl border-2 flex flex-col items-center text-center group transition-all duration-300 cursor-pointer relative overflow-hidden",
              activeTab === "pdf" 
                ? "bg-white border-[#8b5cf6] shadow-md shadow-indigo-100 scale-[1.02]" 
                : "bg-white border-stone-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30"
            )}
          >
            {activeTab === "pdf" && (
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-indigo-400 to-[#8b5cf6]" />
            )}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300",
              activeTab === "pdf" ? "bg-[#8b5cf6] text-white scale-110 shadow-lg shadow-indigo-200" : "bg-indigo-100 text-indigo-600 group-hover:scale-110"
            )}>
              <FileText className="w-7 h-7" />
            </div>
            <h3 className={cn("font-black text-sm mb-1 transition-colors", activeTab === "pdf" ? "text-[#8b5cf6]" : "text-stone-900")}>
              Upload PDF
            </h3>
            <p className="text-[10px] font-bold text-stone-400 leading-relaxed uppercase tracking-tighter">
              Buku, Jurnal, atau Modul
            </p>
          </div>

          {/* Tab: Photo */}
          <div 
            onClick={() => setActiveTab("photo")}
            className={cn(
              "p-6 rounded-3xl border-2 flex flex-col items-center text-center group transition-all duration-300 cursor-pointer relative overflow-hidden",
              activeTab === "photo" 
                ? "bg-white border-[#ffc800] shadow-md shadow-amber-100 scale-[1.02]" 
                : "bg-white border-stone-100 shadow-sm hover:border-amber-200 hover:bg-amber-50/30"
            )}
          >
            {activeTab === "photo" && (
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-yellow-400 to-[#ffc800]" />
            )}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300",
              activeTab === "photo" ? "bg-[#ffc800] text-white scale-110 shadow-lg shadow-amber-200" : "bg-amber-100 text-amber-600 group-hover:scale-110"
            )}>
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className={cn("font-black text-sm mb-1 transition-colors", activeTab === "photo" ? "text-amber-500" : "text-stone-900")}>
              Foto Materi
            </h3>
            <p className="text-[10px] font-bold text-stone-400 leading-relaxed uppercase tracking-tighter">
              Catatan atau Papan Tulis
            </p>
          </div>

          {/* Tab: Search */}
          <div 
            onClick={() => setActiveTab("search")}
            className={cn(
               "p-6 rounded-3xl border-2 flex flex-col items-center text-center group transition-all duration-300 cursor-pointer relative overflow-hidden",
               activeTab === "search" 
                 ? "bg-white border-[#ec4899] shadow-md shadow-pink-100 scale-[1.02]" 
                 : "bg-white border-stone-100 shadow-sm hover:border-pink-200 hover:bg-pink-50/30"
            )}
          >
             {activeTab === "search" && (
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-pink-400 to-[#ec4899]" />
            )}
            <div className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300",
               activeTab === "search" ? "bg-[#ec4899] text-white scale-110 shadow-lg shadow-pink-200" : "bg-fuchsia-100 text-fuchsia-600 group-hover:scale-110"
            )}>
              <Search className="w-7 h-7" />
            </div>
            <h3 className={cn("font-black text-sm mb-1 transition-colors", activeTab === "search" ? "text-pink-600" : "text-stone-900")}>
              Cari Topik
            </h3>
            <p className="text-[10px] font-bold text-stone-400 leading-relaxed uppercase tracking-tighter">
              Ketik topik apa saja
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden transition-all duration-500 ease-in-out">
          {/* Dynamic Background Glow based on Active Tab */}
          <div className={cn(
            "absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 transition-colors duration-700 pointer-events-none opacity-40",
            activeTab === "pdf" && "bg-indigo-300",
            activeTab === "photo" && "bg-amber-300",
            activeTab === "search" && "bg-pink-300"
          )} />

          <div className="relative z-10">
            {activeTab === "pdf" && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm border-b-4 border-indigo-200">
                        <FileText className="w-6 h-6 text-indigo-500" />
                     </div>
                     <h2 className="text-xl font-black text-stone-900">
                        Upload Dokumen PDF
                     </h2>
                  </div>
                  <PdfUploader />
               </div>
            )}

            {activeTab === "photo" && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm border-b-4 border-amber-200">
                        <Camera className="w-6 h-6 text-amber-500" />
                     </div>
                     <h2 className="text-xl font-black text-stone-900">
                        Ambil Foto Materi
                     </h2>
                  </div>
                  
                  <div className="w-full max-w-2xl mx-auto mt-8 mb-16">
                     <div className="border-2 border-dashed border-stone-300 rounded-3xl p-12 bg-stone-50 hover:bg-[#fffbeb] hover:border-amber-300 transition-colors group cursor-pointer text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                           <UploadCloud className="w-8 h-8 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-black text-stone-800 mb-2">Jepret atau Unggah Foto</h3>
                        <p className="text-stone-500 text-sm font-medium mb-6 max-w-md">
                           Foto rangkuman catatanmu, papan tulis di kelas, atau modul buku cetak. EVOCA akan mengekstrak teksnya jadi kuis interaktif!
                        </p>
                        <div className="flex gap-4">
                           <button className="px-6 py-3 bg-white border border-stone-200 rounded-xl font-bold text-stone-600 text-sm hover:bg-stone-100 shadow-sm transition-colors flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" /> Cari File Foto
                           </button>
                           <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_0_0_#d97706] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#d97706] transition-all flex items-center gap-2">
                              <Camera className="w-4 h-4" /> Buka Kamera
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === "search" && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center shadow-sm border-b-4 border-pink-200">
                        <Search className="w-6 h-6 text-pink-500" />
                     </div>
                     <h2 className="text-xl font-black text-stone-900">
                        Pencarian Topik AI
                     </h2>
                  </div>
                  
                  <div className="w-full max-w-2xl mx-auto mt-12 mb-10 text-center flex flex-col items-center">
                     <p className="text-stone-600 text-base mb-8 max-w-lg font-medium leading-relaxed">
                        Cukup ketik konsep yang ingin kamu kuasai hari ini, biarkan AI kami yang akan menyusunkan modul belajar khusus untukmu.
                     </p>
                     
                     <div className="relative w-full group mb-12">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                           <Search className="w-6 h-6 text-stone-400 group-focus-within:text-pink-500 transition-colors" />
                        </div>
                        <input 
                           type="text"
                           placeholder="Cth: Hukum Newton 2, Cara Kerja Ginjal..."
                           className="w-full pl-16 pr-32 py-5 text-lg font-bold text-stone-800 bg-white border-2 border-stone-200 rounded-3xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm placeholder:font-medium placeholder:text-stone-300"
                        />
                        <button className="absolute inset-y-2 right-2 px-6 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-sm transition-colors">
                           Cari <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>

                     <div className="w-full">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 px-2 text-left">Topik Populer Hari Ini 🔥</p>
                        <div className="flex flex-wrap gap-2">
                           {["Sel dan Organel", "Revolusi Industri", "Logaritma", "Sistem Periodik Unsur", "Gerak Lurus Beraturan"].map((topic) => (
                              <button key={topic} className="px-4 py-2.5 bg-stone-50 border border-stone-200 text-stone-600 text-sm font-bold rounded-2xl hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-colors">
                                 {topic}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            <div className="mt-8 p-6 bg-stone-50 rounded-3xl border border-stone-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-stone-900 uppercase tracking-widest mb-1.5 mt-0.5">
                    Tips Ahli
                  </h4>
                  <p className="text-sm font-medium text-stone-500 leading-relaxed">
                    Semakin detail materi yang kamu masukkan, semakin personal dan interaktif simulasi belajar yang bisa EVOCA ciptakan untukmu!
                  </p>
                </div>
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
