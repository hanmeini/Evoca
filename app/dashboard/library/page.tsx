import { BookOpen, Search, FolderOpen, MoreVertical } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight">
            My Library
          </h1>
          <p className="text-sm font-bold text-stone-400 mt-1">
            Materi pembelajaran tersimpan.
          </p>
        </div>
        <button className="bg-stone-900 text-white p-3 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform">
          <FolderOpen className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-stone-400" />
        </div>
        <input
          type="text"
          className="w-full bg-white border-2 border-stone-100 shadow-sm rounded-full py-4 pl-14 pr-6 text-stone-900 placeholder:text-stone-400 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Cari materi dokumen..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mockup Cards */}
        {[
          {
            title: "Kalkulus Lanjut BAB 3",
            color: "bg-rose-100",
            textColor: "text-rose-600",
          },
          {
            title: "Sejarah Dunia Modern",
            color: "bg-indigo-100",
            textColor: "text-indigo-600",
          },
          {
            title: "Dasar Pemrograman Web",
            color: "bg-emerald-100",
            textColor: "text-emerald-600",
          },
          {
            title: "Materi Biologi Sel",
            color: "bg-amber-100",
            textColor: "text-amber-600",
          },
        ].map((item, id) => (
          <div
            key={id}
            className="bg-white border-2 border-stone-100 rounded-4xl p-6 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className={`w-14 h-14 ${item.color} ${item.textColor} rounded-2xl flex items-center justify-center shadow-inner`}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <button className="text-stone-300 hover:text-stone-900 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-serif font-black text-xl text-stone-900 mb-2">
              {item.title}
            </h3>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Added 2d ago
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
