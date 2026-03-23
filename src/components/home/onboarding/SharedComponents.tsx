import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { LOADING_TIPS } from "./constants";

export const StepDots = ({
  current,
  total = 3,
}: {
  current: number;
  total?: number;
}) => (
  <div className="hidden md:flex items-center gap-0">
    {Array.from({ length: total }).map((_, i) => {
      const index = i + 1;
      const isActive = index === current;
      const isCompleted = index < current;

      return (
        <React.Fragment key={index}>
          <div className="relative flex items-center justify-center">
            <div
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                isActive
                  ? "bg-white border-white shadow-lg scale-110"
                  : isCompleted
                    ? "bg-white/20 border-white/40"
                    : "bg-transparent border-white/20"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-500"
                    : isCompleted
                      ? "bg-white/40"
                      : "bg-white/20"
                }`}
              >
                {isActive && (
                  <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
                )}
              </div>
            </div>
          </div>
          {index < total && (
            <div className="w-12 h-[2px] bg-white/20 overflow-hidden">
              <motion.div
                initial={false}
                animate={{ x: isCompleted ? "0%" : "-100%" }}
                className="h-full bg-white/60 w-full"
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export const RotatingTips = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-16 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-white/70 font-medium italic text-sm md:text-base max-w-md px-4"
        >
          &quot;{LOADING_TIPS[index]}&quot;
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
