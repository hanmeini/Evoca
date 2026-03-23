import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { STROKE_STYLE } from "./constants";

interface IntroStepProps {
  step: number;
}

export const IntroStep = ({ step }: IntroStepProps) => {
  const content = [
    {
      tag: "Evoca Intro",
      title: "PLAY YOUR\nWay experience\nof gaming",
      desc: "Ubah cara belajarmu menjadi petualangan yang seru dan adiktif layaknya bermain game favoritmu.",
      emoji: "🐯",
      image: "/images/tiger-mascot.png",
    },
    {
      tag: "Features",
      title: "PETA QUEST\nInteraktif",
      desc: "Setiap dokumen yang kamu baca adalah quest yang memberimu XP, koin, dan item langka.",
      emoji: "🐲",
      image: "/images/komodo-mascot-new.png",
    },
    {
      tag: "Benefits",
      title: "Level Up\nYour Mind",
      desc: "Tingkatkan rank kamu di leaderboard global dan buktikan kamu adalah pembelajar terkuat.",
      emoji: "🦏",
      image: "/images/badak-mascot.png",
    },
  ][step - 1];

  const bubbleText =
    step === 1
      ? "Rrawr! Ayo mulai belajarmu!"
      : step === 2
        ? "Psst.. Selesaikan quest untuk XP!"
        : "Waktunya naik level!";

  const bubbleColor =
    step === 1
      ? "text-indigo-600 border-indigo-100"
      : step === 2
        ? "text-emerald-600 border-emerald-100"
        : "text-amber-500 border-amber-100";

  return (
    <motion.div
      key={`step${step}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto px-4"
    >
      <div className="w-full text-left max-w-md md:max-w-2xl mx-auto mb-8">
        <span className="text-white/60 uppercase tracking-[0.2em] text-xs md:text-sm mb-2 block">
          {content.tag}
        </span>
        <h1
          style={STROKE_STYLE}
          className="text-4xl md:text-6xl font-black text-transparent leading-tight mb-4 whitespace-pre-line"
        >
          {content.title}
        </h1>
        <p className="text-white/90 text-lg md:text-xl leading-relaxed">
          {content.desc}
        </p>
      </div>

      <div className="relative flex items-center justify-center w-full min-h-[250px] md:min-h-[400px]">
        {content.image ? (
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            animate={{ y: [0, -15, 0] }}
            transition={{
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative w-88 md:w-lg aspect-square flex items-center justify-center cursor-pointer group select-none"
          >
            <Image
              src={content.image}
              alt="Mascot"
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-none"
              priority
              draggable={false}
            />

            {/* Chat Bubble */}
            {bubbleText && (
              <div className="absolute -top-4 -right-4 md:top-0 md:-right-12 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-20">
                <div
                  className={`bg-white px-6 py-4 rounded-3xl rounded-bl-none shadow-2xl border-2 ${bubbleColor} whitespace-nowrap`}
                >
                  <p className={`font-black text-sm md:text-base italic`}>
                    &quot;{bubbleText}&quot;
                  </p>
                  <svg
                    className="absolute -bottom-[14px] left-0 w-6 h-4 text-white"
                    viewBox="0 0 24 16"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0 L24 0 L0 16 Z" />
                    <path
                      d="M0 0 L0 16"
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeWidth="4"
                    />
                    <path
                      d="M0 16 L24 0"
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div
            className={`text-[10rem] md:text-[18rem] drop-shadow-2xl ${step === 2 ? "animate-bounce" : "hover:rotate-12 transition-transform"}`}
          >
            {content.emoji}
          </div>
        )}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 md:w-160 h-96 md:h-160 bg-white rounded-full blur-[80px] md:blur-[120px] -z-10"
        />
      </div>
    </motion.div>
  );
};
