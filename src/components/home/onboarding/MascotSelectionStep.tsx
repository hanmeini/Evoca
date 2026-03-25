import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import { MASCOTS, STROKE_STYLE } from "./constants";
import { MascotType } from "./types";

interface MascotSelectionStepProps {
  selectedMascot: MascotType;
  setSelectedMascot: (m: MascotType) => void;
  setStep: (s: number) => void;
  handleMascotNav: (direction: 'next' | 'prev') => void;
}

export const MascotSelectionStep = ({
  selectedMascot,
  setSelectedMascot,
  setStep,
  handleMascotNav
}: MascotSelectionStepProps) => {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col justify-center gap-4 md:gap-6 text-center px-4 max-w-6xl mx-auto py-12"
    >
      <div className="space-y-1 md:space-y-2">
        <h1
          className="text-4xl md:text-7xl font-black text-transparent mb-2 md:mb-2 uppercase leading-tight tracking-tighter"
          style={STROKE_STYLE}
        >
          Pilih Partner Belajarmu
        </h1>
        <p className="text-white/90 font-black text-xs md:text-lg uppercase tracking-[0.2em] mb-4 md:mb-6">
          SETIAP KARAKTER MEMILIKI KEUNIKAN TERSENDIRI.
        </p>
      </div>

      <div className="relative">
        <div className="hidden md:grid grid-cols-3 gap-10 py-2">
          {MASCOTS.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ y: -15, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative bg-white rounded-5xl p-8 shadow-2xl border-4 transition-all cursor-pointer group ${
                selectedMascot === m.id
                  ? "border-white ring-8 ring-white/20"
                  : "border-white/10 hover:border-white/40"
              }`}
              onClick={() => setSelectedMascot(m.id)}
            >
              <div
                className={`aspect-square ${m.bg} rounded-3xl mb-6 flex items-center justify-center relative shadow-inner overflow-hidden`}
              >
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  draggable={false}
                />
              </div>
              <h3 className={`text-2xl font-black mb-2 uppercase ${m.color}`}>
                {m.name}
              </h3>
              <p className="text-stone-500 font-medium text-base">
                {m.description}
              </p>
              {selectedMascot === m.id && (
                <motion.div
                  layoutId="selection-glow"
                  className="absolute inset-0 bg-white/40 blur-2xl rounded-5xl -z-10"
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex md:hidden flex-col items-center">
          <div className="w-full relative min-h-[460px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {MASCOTS.filter((m) => m.id === selectedMascot).map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0 bg-white rounded-3xl p-8 shadow-2xl border-4 border-white ring-8 ring-white/20 flex flex-col items-center text-center"
                >
                  <div
                    className={`aspect-square ${m.bg} rounded-2xl mb-6 flex items-center justify-center relative shadow-inner overflow-hidden w-full`}
                  >
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      className="object-contain p-4"
                      draggable={false}
                    />
                  </div>
                  <h3 className={`text-2xl font-black mb-2 uppercase ${m.color}`}>
                    {m.name}
                  </h3>
                  <p className="text-stone-500 font-medium text-sm px-4">
                    {m.description}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-10 mt-12 bg-white/5 backdrop-blur-md rounded-full p-2 border border-white/10">
            <button
              onClick={() => handleMascotNav("prev")}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all shadow-lg border border-white/20"
            >
              <ChevronRight className="w-8 h-8 rotate-180" />
            </button>
            <div className="flex gap-2.5">
              {MASCOTS.map((m) => (
                <div
                  key={m.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    selectedMascot === m.id ? "w-8 bg-white" : "bg-white/30"
                  }`}
                  onClick={() => setSelectedMascot(m.id)}
                />
              ))}
            </div>
            <button
              onClick={() => handleMascotNav("next")}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all shadow-lg border border-white/20"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 right-10 z-50">
        <button
          disabled={!selectedMascot}
          onClick={() => setStep(4)}
          className={`group px-10 py-5 rounded-full font-black text-xl md:text-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-4 relative overflow-hidden ${
            selectedMascot
              ? "bg-white text-indigo-600 hover:scale-105 active:scale-95"
              : "bg-white/10 text-white/30 cursor-not-allowed invisible"
          }`}
        >
          {selectedMascot && (
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent w-full h-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
          <span className="relative z-10">Lanjutkan</span>
          <ArrowRight
            className={`w-6 h-6 md:w-8 md:h-8 relative z-10 transition-transform ${
              selectedMascot ? "group-hover:translate-x-2" : ""
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
};
