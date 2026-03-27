"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import Image from "next/image";
import { motion } from "framer-motion";
import { BackgroundMesh, FloatingOrnaments } from "@/src/components/ui/GameVisuals";
import { MASCOTS } from "@/src/components/home/onboarding/constants";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [selectedMascotId, setSelectedMascotId] = useState("tiger");

  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    const savedMascot = localStorage.getItem("selectedMascot");
    if (savedMascot) {
      setSelectedMascotId(savedMascot);
    }
  }, []);

  const currentMascot = MASCOTS.find((m) => m.id === selectedMascotId) || MASCOTS[0];

  const getMascotGreeting = (id: string) => {
    switch (id) {
      case "tiger": return "Rrawr! Ayo lanjut questmu!";
      case "komodo": return "Halo! Mari kita atur strategi!";
      case "rhino": return "Tetap kuat! Lanjutkan belajarmu!";
      default: return "Ayo mulai petualanganmu!";
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      // Router push is handled in context
    } catch (err) {
      console.error(err);
      setError("Failed to sign up with Google.");
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <BackgroundMesh variant="indigo" />
      <FloatingOrnaments step={3} />

      {/* Back to Home CTA */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-12 w-full max-w-6xl relative z-10 px-4 md:px-0 mt-8 mb-8">
        {/* Mascot Side */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/3 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative group lg:translate-x-12"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <Image 
                src={currentMascot.image} 
                alt={currentMascot.name} 
                fill 
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-float"
                priority
                draggable={false}
              />
              {/* Pulsing glow background */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 ${currentMascot.bg.replace('bg-', 'bg-').replace('50', '200')} rounded-full blur-[60px] -z-10 opacity-50 animate-pulse`} />
            </div>

            {/* Speech Bubble */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-12 -left-12 z-20"
            >
              <div className="bg-white px-6 py-4 rounded-3xl rounded-bl-none shadow-2xl border-2 border-rose-100 whitespace-nowrap">
                <p className={`font-black ${currentMascot.color} italic text-sm md:text-base`}>
                  &quot;{getMascotGreeting(currentMascot.id)}&quot;
                </p>
                <svg className="absolute -bottom-[14px] left-0 w-6 h-4 text-white" viewBox="0 0 24 16" fill="currentColor">
                  <path d="M0 0 L24 0 L0 16 Z" />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Form Side */}
        <div className="w-full max-w-[450px] bg-white rounded-4xl p-8 shadow-2xl border border-stone-100 relative">
          {/* Mobile Mascot Header */}
          <div className="lg:hidden absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 z-20 pointer-events-none drop-shadow-xl">
            <Image
              src={currentMascot.image}
              alt="Mascot"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-stone-900 mb-6 mx-auto group"
            >
              <Image src="/favicon.ico" alt="Evoca Logo" width={32} height={32} className="w-8 h-8 object-contain transition-all group-hover:-rotate-6 group-hover:scale-110" />
              <span className="font-serif font-black text-2xl tracking-tight">
                Evoca
              </span>
            </Link>
            <h1 className="text-2xl font-serif font-black text-stone-900 mb-2">
              Create an Account
            </h1>
            <p className="text-stone-500 text-sm font-medium">
              Join thousands of students leveling up their learning.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl text-center">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-100 text-stone-900 font-bold px-4 py-4 rounded-full hover:bg-stone-50 hover:border-stone-200 transition-all mb-4 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loadingGoogle ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <p className="text-center text-sm font-medium text-stone-500 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-stone-900 hover:text-rose-500 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
