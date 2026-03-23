"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { BackgroundMesh, FloatingOrnaments } from "../ui/GameVisuals";

// Modular Onboarding Components
import { MascotType, CommitmentLevel } from "./onboarding/types";
import { MASCOTS } from "./onboarding/constants";
import { StepDots } from "./onboarding/SharedComponents";
import { IntroStep } from "./onboarding/IntroStep";
import { LoadingStep } from "./onboarding/LoadingStep";
import { MascotSelectionStep } from "./onboarding/MascotSelectionStep";
import { CommitmentStep } from "./onboarding/CommitmentStep";
import { RewardStep } from "./onboarding/RewardStep";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [selectedMascot, setSelectedMascot] = useState<MascotType>(MASCOTS[0].id);
  const [commitment, setCommitment] = useState<CommitmentLevel | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(1);

  const handleMascotNav = (direction: 'next' | 'prev') => {
    const currentIndex = MASCOTS.findIndex(m => m.id === selectedMascot);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Boundary check (stick at ends)
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= MASCOTS.length) nextIndex = MASCOTS.length - 1;
    
    setSelectedMascot(MASCOTS[nextIndex].id);
  };

  // Realistic variable-speed loading progress
  useEffect(() => {
    if (step === 4) {
      let currentProgress = 1;
      let timeoutId: NodeJS.Timeout;

      const advanceProgress = () => {
        // Random increment 1-8 for realistic chunking
        const increment = Math.floor(Math.random() * 8) + 1; 
        currentProgress = Math.min(currentProgress + increment, 100);
        setLoadingProgress(currentProgress);

        if (currentProgress < 100) {
          // Random delay 50-250ms for realistic pacing
          const nextDelay = Math.random() * 200 + 50; 
          timeoutId = setTimeout(advanceProgress, nextDelay);
        }
      };

      timeoutId = setTimeout(advanceProgress, 200);

      return () => {
        clearTimeout(timeoutId);
        setLoadingProgress(1); // Reset when leaving step 4
      };
    }
  }, [step]);

  // Auto-progress to step 7 when loading is done
  useEffect(() => {
    if (step === 4 && loadingProgress === 100) {
      const timer = setTimeout(() => setStep(7), 1000); // Give 1s to view the 100% state
      return () => clearTimeout(timer);
    }
  }, [step, loadingProgress]);

  const getThemeColors = () => {
    switch(step) {
      case 1:
      case 4:
      case 5:
      case 6: return { main: "bg-indigo-600", accent: "bg-indigo-700/50", text: "text-indigo-600" };
      case 2: return { main: "bg-emerald-500", accent: "bg-emerald-600/50", text: "text-emerald-600" };
      case 3: return { main: "bg-amber-400", accent: "bg-amber-500/50", text: "text-amber-500" };
      default: return { main: "bg-white", accent: "bg-stone-100", text: "text-stone-900" };
    }
  };

  const theme = getThemeColors();

  const renderContent = () => {
    switch (step) {
      case 1:
      case 2:
      case 3:
        return <IntroStep step={step} />;
      case 4:
        return <LoadingStep loadingProgress={loadingProgress} selectedMascot={selectedMascot} />;
      case 5:
        return (
          <MascotSelectionStep 
            selectedMascot={selectedMascot} 
            setSelectedMascot={setSelectedMascot} 
            setStep={setStep} 
            handleMascotNav={handleMascotNav}
          />
        );
      case 6:
        return null; // Skipped commitment step
      case 7:
        return <RewardStep selectedMascot={selectedMascot} />;
      default:
        return null;
    }
  };

  return (
    <section
      className={`relative h-screen flex flex-col overflow-hidden transition-colors duration-700 font-(family-name:--font-lilita) ${theme.main}`}
    >
      {/* Dynamic Background for Steps 1-3 */}
      <BackgroundMesh step={step} />
      <FloatingOrnaments step={step} />

      {/* Background Decor - Only for Commitment (Step 6) */}
      {step === 6 && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-indigo-400 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-300 rounded-full blur-[120px] animate-pulse" />
        </div>
      )}

      {/* Top Navigation - Back Arrow (Hide on Step 5) */}
      {step !== 5 && (
        <div className="fixed top-8 left-8 z-50">
           <div 
             className={`w-12 h-12 rounded-full flex items-center justify-center ${step <= 3 ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-stone-100 text-stone-900'} backdrop-blur-sm cursor-pointer hover:scale-110 transition-all`} 
             onClick={() => step > 1 && setStep(step - 1)}
           >
              <ChevronRight className={`w-8 h-8 rotate-180`} />
           </div>
        </div>
      )}

      {/* Top Right Skip Ornament (Steps 1-3) */}
      {step <= 3 && (
        <div className="fixed top-0 right-0 z-50 pointer-events-none">
          <div
            className={`w-48 h-48 md:w-64 md:h-64 rounded-bl-full ${theme.accent} translate-x-1/4 -translate-y-1/4 transition-colors duration-700`}
          />
          <button
            onClick={() => setStep(5)}
            className="absolute top-8 right-8 pointer-events-auto px-6 py-2 transition-all font-black tracking-widest uppercase text-base text-white hover:scale-110"
          >
            Skip
          </button>
        </div>
      )}

      {/* Skip only for Commitment (Step 6) */}
      {step === 6 && (
        <div className="fixed top-8 right-8 z-50">
          <button
            onClick={() => (window.location.href = "/register")}
            className="px-6 py-2 rounded-full border-2 border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-900 transition-all font-bold tracking-widest uppercase text-sm"
          >
            Skip
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full relative z-10 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>

      {/* Global Bottom Navigation (Steps 1-3) */}
      {step <= 3 && (
        <div className="fixed bottom-10 left-0 right-0 z-50 px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
            <StepDots current={step} />

            <button
              onClick={() => setStep(step === 3 ? 5 : step + 1)}
              className={`flex-1 md:flex-initial md:min-w-[240px] bg-white ${theme.text} py-6 rounded-full font-black text-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3`}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
