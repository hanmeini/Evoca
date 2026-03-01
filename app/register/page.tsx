"use client";

import Link from "next/link";
import { BookOpen, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setLoadingEmail(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // NOTE: In a real app we would also save the firstName and lastName to Firestore now.
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Failed to create an account.");
    } finally {
      setLoadingEmail(false);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-evoca-bg)] p-4">
      {/* Back to Home CTA */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-[450px] bg-white rounded-4xl p-8 shadow-2xl shadow-stone-200/50 border border-stone-100 mt-12 mb-12">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-stone-900 mb-6 mx-auto group"
          >
            <div className="p-2 bg-stone-900 text-white rounded-[1rem] group-hover:bg-rose-500 transition-all group-hover:-rotate-6 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
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
          disabled={loadingGoogle || loadingEmail}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-100 text-stone-900 font-bold px-4 py-3 rounded-full hover:bg-stone-50 hover:border-stone-200 transition-all mb-6 shadow-sm hover:shadow-md disabled:opacity-50"
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
          Sign up with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-stone-400 font-bold">
              Or sign up with email
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-bold text-stone-700 mb-2 ml-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-2xl border-2 border-stone-100 focus:outline-none focus:ring-0 focus:border-rose-400 transition-colors bg-stone-50/50 font-medium"
                placeholder="Jane"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-bold text-stone-700 mb-2 ml-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-2xl border-2 border-stone-100 focus:outline-none focus:ring-0 focus:border-rose-400 transition-colors bg-stone-50/50 font-medium"
                placeholder="Doe"
              />
            </div>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-2xl border-2 border-stone-100 focus:outline-none focus:ring-0 focus:border-rose-400 transition-colors bg-stone-50/50 font-medium"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-stone-700 mb-2 ml-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-5 py-3 rounded-2xl border-2 border-stone-100 focus:outline-none focus:ring-0 focus:border-rose-400 transition-colors bg-stone-50/50 font-medium tracking-widest"
              placeholder="Min 8 chars"
            />
          </div>

          <div className="pt-2 pb-2">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                className="mt-1 flex-shrink-0 w-4 h-4 rounded-sm border-2 border-stone-300 text-rose-500 focus:ring-rose-500 transition-colors cursor-pointer"
              />
              <span className="text-sm text-stone-500 font-medium leading-relaxed">
                I agree to the{" "}
                <a
                  href="#"
                  className="font-bold text-stone-900 hover:text-rose-500 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-bold text-stone-900 hover:text-rose-500 transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loadingEmail || loadingGoogle}
            className="w-full bg-stone-900 text-white font-bold px-4 py-4 rounded-full hover:bg-rose-500 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 shadow-lg shadow-stone-200 mt-4 disabled:opacity-50"
          >
            {loadingEmail ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Create Account"
            )}{" "}
            {!loadingEmail && <UserPlus className="w-5 h-5" />}
          </button>
        </form>

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
  );
}
