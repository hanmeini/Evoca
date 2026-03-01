import { BookOpen, Target, Users } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[var(--color-evoca-bg)] min-h-screen py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-40 h-40 bg-fuchsia-400 rounded-full blur-[80px] opacity-40 mix-blend-multiply"></div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-6 tracking-tight relative z-10">
            Our Mission: Make Learning Addictive
          </h1>
          <p className="text-lg text-stone-700 max-w-2xl mx-auto font-medium relative z-10">
            We believe that studying shouldn&apos;t be a chore. By combining
            AI-powered insights with gamification, we are building a world where
            students actually want to read their textbooks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20 relative z-10">
          <div className="bg-[#FFE4E6] p-8 rounded-[2.5rem] shadow-xl border border-white text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-sm">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-3 font-serif">
              The Goal
            </h3>
            <p className="text-sm text-stone-700 font-medium flex-1">
              Turn 10 hours of boring reading into 2 hours of highly engaging,
              interactive learning.
            </p>
          </div>
          <div className="bg-[#D1FAE5] p-8 rounded-[2.5rem] shadow-xl border border-white text-center hover:-translate-y-2 transition-transform duration-300 md:mt-8">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6 shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-3 font-serif">
              The Method
            </h3>
            <p className="text-sm text-stone-700 font-medium flex-1">
              Auto-generated Quizzes, Podcasts, and Chatbots based entirely on
              your own uploaded materials.
            </p>
          </div>
          <div className="bg-[#FEF3C7] p-8 rounded-[2.5rem] shadow-xl border border-white text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-3 font-serif">
              The Community
            </h3>
            <p className="text-sm text-stone-700 font-medium flex-1">
              Join thousands of students competing on global leaderboards and
              sharing their study materials.
            </p>
          </div>
        </div>

        <div className="bg-stone-900 text-white rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -m-10 w-60 h-60 bg-indigo-500 rounded-full blur-[80px] opacity-40 mix-blend-screen" />
          <h2 className="text-3xl md:text-4xl font-serif font-black mb-6 relative z-10">
            Ready to join the revolution?
          </h2>
          <p className="text-stone-300 mb-10 max-w-xl mx-auto font-medium relative z-10 text-lg">
            Start uploading your PDFs today and watch your productivity
            skyrocket.
          </p>
          <Link
            href="/register"
            className="inline-flex bg-white text-stone-900 font-bold px-8 py-5 rounded-full hover:scale-105 transition-transform items-center gap-2 group shadow-xl relative z-10"
          >
            Get Started{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
