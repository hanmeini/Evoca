"use client";

import Link from "next/link";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none flex justify-center">
      <nav className="pointer-events-auto w-full max-w-5xl bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-stone-100 px-6 py-3 transition-all">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-900 group"
          >
            <div className="p-2 bg-stone-900 text-white rounded-[1rem] group-hover:bg-rose-500 group-hover:rotate-6 transition-all">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">
              Evoca
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex gap-1 bg-stone-100/50 p-1 rounded-full">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-white rounded-full transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-4">
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2 px-3 py-2 rounded-full hover:bg-stone-50"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-stone-900 text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:bg-rose-500 transition-all"
              >
                Start for free
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="bg-white border border-stone-100 rounded-3xl p-4 flex flex-col gap-2 shadow-lg mb-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-4 py-3 rounded-2xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-stone-100 my-2 mx-4" />
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-sm font-medium text-stone-900 bg-stone-50 px-4 py-3 rounded-2xl hover:bg-stone-100 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-sm font-medium bg-stone-900 text-white px-4 py-4 rounded-2xl shadow-md hover:bg-rose-500 transition-colors"
                  >
                    Start for free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
