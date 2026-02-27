import { PdfUploader } from "@/src/components/ui/PdfUploader";
import { BookText, Headphones, MessageSquareText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-stone-100 py-16 md:py-24 border-b border-stone-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PdfUploader />
        </div>
      </section>

      {/* Library Section */}
      <section className="py-16 md:py-24 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 mb-2">
                Your Library
              </h2>
              <p className="text-stone-500 font-serif">
                Here&apos;s a look at what you&apos;ve uploaded previously.
              </p>
            </div>
            {/* Simple filtering/sorting placeholder */}
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-stone-600">
              <span className="text-stone-900 border-b-2 border-stone-900 pb-1 cursor-pointer">
                All
              </span>
              <span className="hover:text-stone-900 cursor-pointer">
                Recent
              </span>
              <span className="hover:text-stone-900 cursor-pointer">
                Favorites
              </span>
            </div>
          </div>

          {/* Grid setup for document cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dummy Card 1 */}
            <div className="group relative border border-stone-200 bg-white rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-rose-50 rounded text-rose-600">
                  <BookText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Dec 12, 2024
                </span>
              </div>
              <Link href="/ai-reader/demo-1" className="block outline-none">
                <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-2 mb-2">
                  The Impact of Artificial Intelligence on Modern Education
                </h3>
              </Link>
              <p className="text-sm text-stone-500 line-clamp-3 mb-6">
                Intelligent reading experience powered by Google Gemini. Upload
                a document, and let AI transform it into interactive learning
                formats tailored to your needs.
              </p>

              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                  <BookText className="w-3.5 h-3.5" /> Quiz
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                  <Headphones className="w-3.5 h-3.5" /> Podcast
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                  <MessageSquareText className="w-3.5 h-3.5" /> Chat
                </div>
              </div>
            </div>

            {/* Dummy Card 2 */}
            <div className="group relative border border-stone-200 bg-white rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded text-blue-600">
                  <BookText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Nov 28, 2024
                </span>
              </div>
              <Link href="/ai-reader/demo-2" className="block outline-none">
                <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-2 mb-2">
                  Introduction to Quantum Computing Algorithms
                </h3>
              </Link>
              <p className="text-sm text-stone-500 line-clamp-3 mb-6">
                Exploring the foundational algorithms of quantum computation,
                including Shor&apos;s algorithm and Grover&apos;s search, and
                their theoretical implications.
              </p>

              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                  <BookText className="w-3.5 h-3.5" /> Quiz
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                  <Headphones className="w-3.5 h-3.5" /> Podcast
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                  <MessageSquareText className="w-3.5 h-3.5" /> Chat
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
