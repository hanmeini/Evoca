import { PdfUploader } from "@/src/components/ui/PdfUploader";
import {
  Search,
  Bell,
  Briefcase,
  Camera,
  Mic,
  Video,
  Users,
} from "lucide-react";

export default function DashboardOverviewPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen pb-24">
      {/* Header Profile */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-stone-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-2xl">
            🧑🏽‍🦱
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900 leading-tight">
              Hello, User
            </h1>
            <p className="text-sm font-bold text-stone-400">Level Up</p>
          </div>
        </div>
        <button className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center relative hover:bg-stone-50 transition-colors">
          <Bell className="w-5 h-5 text-stone-600" />
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full"></div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-stone-400" />
        </div>
        <input
          type="text"
          className="w-full bg-white border-0 shadow-sm rounded-full py-4 pl-14 pr-6 text-stone-900 placeholder:text-stone-400 font-medium focus:ring-2 focus:ring-fuchsia-500 outline-none"
          placeholder="Search courses, documents..."
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Featured Course Card */}
          <div className="bg-[#93C5FD] rounded-4xl p-8 shadow-lg border border-white text-stone-900 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:opacity-30 transition-opacity">
              <Briefcase className="w-48 h-48" />
            </div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-sm">
                2/3
              </div>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-1">
                UX Lab: Motion Edition
              </h2>
              <p className="text-stone-700 font-medium mb-6">Joseph Smith</p>
              <button className="bg-stone-900 text-white font-bold px-6 py-3 rounded-full hover:bg-stone-800 transition-colors shadow-xl">
                JOIN NOW
              </button>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="bg-stone-200/50 p-2 rounded-full flex justify-between gap-2 shadow-inner">
            <button className="flex-1 bg-stone-900 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-sm">
              💡 Logic
            </button>
            <button className="flex-1 text-stone-600 hover:text-stone-900 font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-colors">
              👁️ Visual
            </button>
            <button className="flex-1 text-stone-600 hover:text-stone-900 font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-colors">
              🎯 Focus
            </button>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-[#F472B6] rounded-4xl p-6 shadow-sm border border-white relative group min-h-[180px] hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-auto">
                <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white">
                  ▲
                </div>
                <div className="bg-white/40 px-3 py-1 rounded-full text-xs font-bold text-stone-900">
                  1/3
                </div>
              </div>
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🧔🏻‍♂️</span>
                  <span className="text-xs font-bold font-serif opacity-80 text-stone-900">
                    by Maksym B.
                  </span>
                </div>
                <h3 className="font-black text-stone-900 leading-tight mb-1">
                  Design
                  <br />
                  Odyssey
                </h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-stone-800">
                  <Briefcase className="w-3 h-3" /> Brief 001
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FBBF24] rounded-4xl p-6 shadow-sm border border-white relative group min-h-[180px] hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-auto">
                <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white">
                  ◑
                </div>
              </div>
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">👨🏼‍🦰</span>
                  <span className="text-xs font-bold font-serif opacity-80 text-stone-900">
                    by Maksym B.
                  </span>
                </div>
                <h3 className="font-black text-stone-900 leading-tight mb-1">
                  Focus
                  <br />
                  Mode
                </h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-stone-800">
                  <Briefcase className="w-3 h-3" /> Brief 002
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* AI Assistant Card (from mockup) */}
          <div className="bg-[#A78BFA] rounded-4xl p-8 shadow-lg border border-white text-white relative">
            <div className="flex justify-between items-center mb-6">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 bg-rose-400 rounded-full border-2 border-[#A78BFA] flex items-center justify-center font-bold">
                  1
                </div>
                <div className="w-10 h-10 bg-amber-400 rounded-full border-2 border-[#A78BFA] flex items-center justify-center font-bold">
                  2
                </div>
                <div className="w-10 h-10 bg-emerald-400 rounded-full border-2 border-[#A78BFA] flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Users className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-40 flex items-center justify-center mb-6">
              {/* Decorative sound wave graphic representation */}
              <div className="w-32 h-32 border-4 border-white/30 rounded-3xl rotate-12 absolute animate-pulse"></div>
              <div className="w-24 h-24 border-4 border-white/60 rounded-full absolute -rotate-12"></div>
              <div className="bg-white text-indigo-900 font-bold px-4 py-2 rounded-full text-sm shadow-xl z-10 relative mt-16 animate-bounce">
                Hi! How can I help you?
              </div>
            </div>

            <div className="flex justify-center items-center gap-6">
              <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
              <button className="w-16 h-16 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-xl hover:-translate-y-1 transition-transform">
                <Mic className="w-6 h-6" />
              </button>
              <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Upload Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-bold text-stone-900 font-serif mb-4 flex justify-between items-center">
              <span>Add New Material</span>
              <span className="text-xs bg-stone-100 px-2 py-1 rounded-full text-stone-500">
                Fast Upload
              </span>
            </h3>
            <PdfUploader />
          </div>
        </div>
      </div>
    </div>
  );
}
