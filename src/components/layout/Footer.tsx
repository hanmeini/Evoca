import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-stone-900 mb-4 group"
            >
              <div className="p-1.5 bg-stone-900 text-white rounded-lg group-hover:bg-rose-600 transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">
                Evoca
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed mb-6">
              Transform your reading into a gamified learning experience. Level
              up as you read, learn, and master new concepts.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <span className="text-sm text-stone-500 hover:text-stone-900 transition-colors cursor-pointer">
                  Blog
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-stone-500 hover:text-stone-900 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-stone-500 hover:text-stone-900 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} Evoca Learning. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social icons placeholders */}
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer">
              <span className="sr-only">Twitter</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer">
              <span className="sr-only">LinkedIn</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer">
              <span className="sr-only">GitHub</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
