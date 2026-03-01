import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started with gamified learning.",
      features: [
        "Upload up to 5 PDFs per month",
        "Generate 10 Quizzes",
        "Basic Leveling and XP Tracking",
        "Standard Speed Voice Generation",
      ],
      cta: "Start Free",
      href: "/register",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For serious students who want to accelerate learning.",
      features: [
        "Unlimited PDF Uploads",
        "Unlimited Quizzes & Podcasts",
        "Advanced Analytics & XP Tracking",
        "Premium Ultra-Fast ElevenLabs Voices",
        "Exclusive Profile Badges",
        "Detailed Study Habits Reporting",
      ],
      cta: "Get Pro",
      href: "/register?plan=pro",
      popular: true,
    },
    {
      name: "Campus",
      price: "Custom",
      description: "For institutions and shared study groups.",
      features: [
        "Everything in Pro",
        "Shared Organization Leaderboards",
        "Custom Branding Options",
        "Priority 24/7 Support",
        "Dedicated Account Manager",
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
    },
  ];

  return (
    <div className="bg-[var(--color-evoca-bg)] min-h-screen py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-20 relative">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400 rounded-full blur-[100px] opacity-30 mix-blend-multiply"></div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-6 tracking-tight relative z-10">
            Level up your learning. <br /> Pick your power-up.
          </h1>
          <p className="text-lg text-stone-700 font-medium max-w-2xl mx-auto leading-relaxed relative z-10">
            Choose a plan that fits your study needs. Start for free and upgrade
            when you are ready to conquer harder material.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-[2.5rem] p-8 relative flex flex-col transition-transform duration-300 ${
                tier.popular
                  ? "bg-stone-900 text-white shadow-2xl scale-105 hover:scale-110 border-4 border-fuchsia-500"
                  : "bg-white text-stone-900 shadow-xl border border-white hover:-translate-y-2"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-fuchsia-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider py-2 px-4 rounded-full flex items-center gap-1 shadow-lg">
                    <Zap
                      className="w-4 h-4 text-amber-200"
                      fill="currentColor"
                    />{" "}
                    Most Popular
                  </span>
                </div>
              )}

              <h3
                className={`text-2xl font-black font-serif mb-2 ${tier.popular ? "text-white" : "text-stone-900"}`}
              >
                {tier.name}
              </h3>
              <p
                className={`text-sm font-medium mb-6 h-10 ${tier.popular ? "text-stone-400" : "text-stone-500"}`}
              >
                {tier.description}
              </p>
              <div className="mb-8">
                <span
                  className={`text-5xl font-black tracking-tight ${tier.popular ? "text-white" : "text-stone-900"}`}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span
                    className={`font-bold ml-1 ${tier.popular ? "text-stone-400" : "text-stone-500"}`}
                  >
                    {tier.period}
                  </span>
                )}
              </div>

              <Link
                href={tier.href}
                className={`w-full py-4 px-6 rounded-full text-center font-bold mb-10 transition-colors shadow-md ${
                  tier.popular
                    ? "bg-white text-stone-900 hover:bg-stone-200"
                    : "bg-transparent border-2 border-stone-200 text-stone-900 hover:bg-stone-50"
                }`}
              >
                {tier.cta}
              </Link>

              <div className="flex-1">
                <p
                  className={`text-sm font-black mb-6 uppercase tracking-widest ${tier.popular ? "text-stone-300" : "text-stone-400"}`}
                >
                  Features Included
                </p>
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 ${tier.popular ? "text-fuchsia-400" : "text-indigo-500"}`}
                      />
                      <span
                        className={`text-sm font-medium ${tier.popular ? "text-stone-300" : "text-stone-700"}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
