import { Mail, MessageSquare, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-[var(--color-evoca-bg)] min-h-screen py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-400 rounded-full blur-[100px] opacity-30 mix-blend-multiply"></div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-6 tracking-tight relative z-10">
            Get in Touch
          </h1>
          <p className="text-lg text-stone-700 font-medium max-w-2xl mx-auto leading-relaxed relative z-10">
            Have questions about Evoca? Want to see how gamified learning can
            help your school? Drop us a line.
          </p>
        </div>

        <div className="grid md:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden shadow-stone-200/50">
          {/* Left Info Column */}
          <div className="bg-stone-900 p-10 md:p-14 text-white flex flex-col justify-center relative shadow-inner overflow-hidden">
            <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-fuchsia-500 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
            <h3 className="text-3xl font-serif font-black mb-10 relative z-10">
              Contact Information
            </h3>
            <div className="space-y-10 relative z-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm border border-white/20 hover:-rotate-12 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold mb-1 uppercase tracking-widest">
                    Email Us
                  </p>
                  <p className="font-bold text-lg">hello@evoca.ai</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm border border-white/20 hover:-rotate-12 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold mb-1 uppercase tracking-widest">
                    Discord Community
                  </p>
                  <p className="font-bold text-lg">discord.gg/evoca-learn</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm border border-white/20 hover:-rotate-12 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold mb-1 uppercase tracking-widest">
                    Headquarters
                  </p>
                  <p className="font-bold text-lg leading-tight">
                    123 Learning Lane
                    <br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="p-10 md:p-14 bg-white">
            <h3 className="text-2xl font-serif font-black text-stone-900 mb-8">
              Send a Message
            </h3>
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-stone-700 mb-2 ml-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-stone-100 focus:outline-none focus:ring-0 focus:border-indigo-400 font-medium transition-colors bg-stone-50/50"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-stone-700 mb-2 ml-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-stone-100 focus:outline-none focus:ring-0 focus:border-indigo-400 font-medium transition-colors bg-stone-50/50"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-bold text-stone-700 mb-2 ml-1"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-stone-100 focus:outline-none focus:ring-0 focus:border-indigo-400 font-medium transition-colors resize-none bg-stone-50/50"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button
                type="button"
                className="w-full bg-stone-900 text-white font-bold px-8 py-5 rounded-full hover:bg-indigo-500 transition-colors shadow-xl hover:-translate-y-1 hover:rotate-1"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
