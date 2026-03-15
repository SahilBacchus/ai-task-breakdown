"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { syncProfileForUser } from "@/lib/supabase/profiles";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (!data.user) {
        await supabase.auth.signOut();
        setErrorMsg("Sign-in succeeded, but no user was returned.");
        return;
      }

      const { error: profileError } = await syncProfileForUser(data.user);

      if (profileError) {
        await supabase.auth.signOut();
        setErrorMsg(`Sign-in succeeded, but profile sync failed: ${profileError.message}`);
        return;
      }

      router.push("/kanban");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.95),rgba(229,231,235,0.72)_34%,rgba(212,212,216,0.94)_68%),linear-gradient(135deg,#e5e7eb_0%,#d4d4d8_48%,#fef3c7_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_34%,rgba(251,191,36,0.18)_57%,rgba(255,255,255,0)_100%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-white/90 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-24 h-72 w-72 -translate-y-1/2 rounded-full bg-zinc-300/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-amber-300/55 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row">
        <div className="flex flex-1 items-end p-8 lg:p-12">
          <div className="max-w-md text-zinc-800">
            <p className="mb-4 inline-flex items-center rounded-full border border-amber-500/50 bg-zinc-50/85 px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase text-zinc-700 shadow-sm shadow-amber-200/60">
              AI Task Breakdown
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
              Welcome back.
              <br />
              Continue where you left off.
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
              Sign in to view your board, update priorities, and keep tasks moving.
              New here? Create an account in a minute.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-white/95 to-zinc-100/88 p-6 shadow-[0_24px_70px_-40px_rgba(113,113,122,0.85),0_20px_40px_-30px_rgba(245,158,11,0.65)] backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-zinc-900">Login</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Use your account credentials to sign in.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Email</span>
                <div className="flex items-center rounded-xl border border-zinc-300/90 bg-zinc-50/85 px-3 transition focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200">
                  <Mail className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Password</span>
                <div className="flex items-center rounded-xl border border-zinc-300/90 bg-zinc-50/85 px-3 transition focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200">
                  <KeyRound className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500"
                    required
                  />
                </div>
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-zinc-600">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-zinc-400 bg-white text-amber-600 focus:ring-amber-500"
                  />
                  Remember me
                </label>
                <Link href="#" className="text-amber-700 hover:text-amber-600">
                  Forgot password?
                </Link>
              </div>

              {errorMsg && (
                <p className="rounded-lg border border-rose-300/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-amber-300/50 transition hover:from-amber-400 hover:via-yellow-200 hover:to-amber-300"
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-amber-700 hover:text-amber-600">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
