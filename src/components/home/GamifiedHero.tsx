"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";

export function GamifiedHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-300 rounded-full blur-[120px] opacity-20 z-0" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-300 rounded-full blur-[100px] opacity-20 z-0" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-300 rounded-full blur-[120px] opacity-20 z-0" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTA */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-stone-100 mb-8"
            >
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              </div>
              <span className="text-sm font-bold text-stone-700 tracking-wide">
                Level Up Your Brain
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-[5.5rem] font-serif font-black text-stone-900 leading-[1.1] mb-6 tracking-tight"
            >
              Education <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500">
                Without Limits
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed max-w-lg font-medium"
            >
              Discover a world of knowledge and take the first step towards
              mastering new skills, at your own pace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/register"
                className="bg-stone-900 text-white font-bold text-lg px-8 py-5 rounded-[2rem] hover:bg-fuchsia-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-fuchsia-500/30 hover:-translate-y-1 w-full sm:w-auto hover:rotate-1"
              >
                Get Started
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating UI Elements */}
          <div className="relative h-[500px] w-full hidden lg:block">
            {/* Main Center Card (Mockup) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-[#EEF2FF] rounded-[2.5rem] shadow-xl p-6 z-20 border border-white"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                  🚀
                </div>
                <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold text-stone-900 shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.9
                </div>
              </div>

              <h3 className="text-2xl font-black text-stone-900 mb-2 font-serif leading-tight">
                From Basics to Breakthroughs
              </h3>

              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 bg-white px-3 py-1.5 rounded-full">
                  ⏱️ 15h 30m
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 bg-white px-3 py-1.5 rounded-full">
                  📚 32 lessons
                </div>
              </div>

              <div className="bg-white rounded-[1.5rem] p-4 flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">
                  People on course
                </span>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs bg-${["purple", "blue", "green", "yellow"][i - 1]}-200`}
                    >
                      {["👩", "👨", "👦", "👧"][i - 1]}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating Card: Study Area */}
            <motion.div
              initial={{ opacity: 0, x: 100, rotate: 10 }}
              animate={{ opacity: 1, x: 0, rotate: 6 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                bounce: 0.4,
              }}
              className="absolute top-[10%] right-0 w-[240px] bg-[#FFE4E6] rounded-[2rem] shadow-xl p-5 z-10 border border-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                  🦊
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-500 uppercase">
                    Current
                  </div>
                  <div className="font-bold text-stone-900">Science Play</div>
                </div>
              </div>
              <div className="w-full bg-white h-3 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-2/3 rounded-full" />
              </div>
            </motion.div>

            {/* Floating Card: Streak */}
            <motion.div
              initial={{ opacity: 0, x: -100, rotate: -20 }}
              animate={{ opacity: 1, x: 0, rotate: -8 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                type: "spring",
                bounce: 0.4,
              }}
              className="absolute bottom-[15%] left-0 w-[200px] bg-[#FEF3C7] rounded-[2rem] shadow-xl p-5 z-30 border border-white text-center"
            >
              <div className="text-4xl mb-2">🔥</div>
              <p className="text-2xl font-black text-stone-900 mb-0.5">
                12 Day
              </p>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                Streak
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
