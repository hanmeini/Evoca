import Link from "next/link";
import { ArrowRight, Brain, Trophy, Target, Zap } from "lucide-react";
import { GamifiedHero } from "@/src/components/home/GamifiedHero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Client-Side Animated Hero */}
      <GamifiedHero />

      {/* Features: The Gamified Loop */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-fuchsia-500 tracking-widest uppercase mb-3">
              Level Up Your Mind
            </h2>
            <h3 className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-6 tracking-tight">
              Learning is no longer a chore. <br className="hidden md:block" />
              It&apos;s a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-amber-500">
                game you can win.
              </span>
            </h3>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto font-medium">
              Evoca transforms boring PDFs into an addictive, rewarding
              experience. Earn experience points, level up your profile, and
              maintain your daily streak simply by reading.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {/* Feature 1 */}
            <div className="bg-[#E0E7FF] rounded-4xl p-8 shadow-xl border border-white hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 text-indigo-500 shadow-sm">
                <Brain className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-stone-900 mb-4 font-serif leading-tight">
                Interactive <br /> Reading
              </h4>
              <p className="text-stone-700 font-medium leading-relaxed">
                Upload any PDF. Our AI instantly converts it into an interactive
                chat, auto-generated podcasts, and dynamic quizzes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FEF3C7] rounded-4xl p-8 shadow-xl border border-white hover:-translate-y-2 transition-transform duration-300 md:mt-12">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 text-amber-500 shadow-sm">
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-stone-900 mb-4 font-serif leading-tight">
                Earn XP & <br /> Level Up
              </h4>
              <p className="text-stone-700 font-medium leading-relaxed">
                Gain experience points for every page you read, quiz you pass,
                and podcast you finish. Watch your rank climb on the global
                leaderboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FCE7F3] rounded-4xl p-8 shadow-xl border border-white hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 text-fuchsia-500 shadow-sm">
                <Target className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-stone-900 mb-4 font-serif leading-tight">
                Maintain <br /> Streaks
              </h4>
              <p className="text-stone-700 font-medium leading-relaxed">
                Build a habit. Read every day to keep your streak alive and
                unlock exclusive badges, avatar frames, and theme customization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="bg-white rounded-5xl p-12 shadow-2xl border border-stone-100 flex flex-wrap justify-center gap-12 md:gap-24">
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-2 group-hover:text-fuchsia-500 transition-colors">
                50k+
              </div>
              <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                Documents Read
              </div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-2 group-hover:text-amber-500 transition-colors">
                1M+
              </div>
              <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                XP Earned
              </div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-2 group-hover:text-blue-500 transition-colors">
                4.9
              </div>
              <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
          <div className="bg-stone-900 rounded-5xl p-12 md:p-20 text-center relative shadow-2xl overflow-hidden shadow-stone-900/20">
            {/* Abstract shapes inside CTA */}
            <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-fuchsia-500 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
            <div className="absolute bottom-0 left-0 -m-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-40 mix-blend-screen" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-stone-800 rounded-3xl mx-auto flex items-center justify-center mb-8 border border-stone-700 shadow-inner">
                <Zap className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-6 tracking-tight max-w-3xl mx-auto leading-tight">
                Ready to turn studying into your favorite game?
              </h2>
              <p className="text-xl text-stone-400 mb-12 max-w-xl mx-auto font-medium">
                Join thousands of learners who are already leveling up their
                knowledge faster than ever before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="bg-white text-stone-900 font-bold text-lg px-8 py-5 rounded-full hover:bg-stone-200 transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto hover:rotate-1"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
