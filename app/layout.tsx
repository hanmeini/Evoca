"use client";

import { Inter, Merriweather } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/src/components/layout/Navbar";
import { Footer } from "@/src/components/layout/Footer";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/src/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

const lato = localFont({
  src: [
    {
      path: "../public/fonts/lato/Lato-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/lato/Lato-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/lato/Lato-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/lato/Lato-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-lato",
});

import { MobileBottomNav } from "@/src/components/layout/MobileBottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Don't show the marketing Navbar/Footer on Auth or Dashboard pages
  const isMarketingPage =
    !pathname?.startsWith("/dashboard") &&
    !pathname?.startsWith("/login") &&
    !pathname?.startsWith("/register") &&
    !pathname?.startsWith("/ai-reader"); // Also hide in the reader view

  const hideMobileNav =
    isMarketingPage ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register");

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${merriweather.variable} ${lato.variable} antialiased bg-[var(--color-evoca-bg)] text-stone-900 font-sans selection:bg-stone-200 min-h-screen pb-24 sm:pb-0`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {isMarketingPage && <Navbar />}
            <main className={`flex-1 ${isMarketingPage ? "pt-16" : ""}`}>
              {children}
            </main>
            {isMarketingPage && <Footer />}

            {!hideMobileNav && <MobileBottomNav />}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
