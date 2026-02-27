import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex bg-stone-900 text-stone-50 p-1.5 rounded-sm group-hover:bg-stone-700 transition-colors">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-stone-900">
            Evoca{" "}
            <span className="text-stone-500 font-sans text-sm font-medium uppercase tracking-widest ml-1">
              AI
            </span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Library
          </Link>
          <a href="#" className="hover:text-stone-900 transition-colors">
            Features
          </a>
          <a href="#" className="hover:text-stone-900 transition-colors">
            About
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-stone-900 hover:text-stone-600 transition-colors">
            Sign In
          </button>
          <button className="hidden sm:inline-flex h-9 items-center justify-center rounded-sm bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 shadow transition-colors hover:bg-stone-800">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
