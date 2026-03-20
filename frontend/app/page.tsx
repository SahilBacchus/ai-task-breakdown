import Link from "next/link";
import { ArrowRight, Sparkles, LayoutGrid, MessageSquare, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[oklch(0.12_0.005_285)] text-[oklch(0.98_0_0)]">
      {/* Ambient Background Effects (matching Auth/Dark styles) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.2_0.05_275),transparent_50%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[oklch(0.65_0.2_275/0.15)] blur-[100px]" />
      <div className="pointer-events-none absolute top-1/4 -left-24 h-72 w-72 -translate-y-1/2 rounded-full bg-[oklch(0.65_0.2_25/0.1)] blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[oklch(0.7_0.18_145/0.1)] blur-[80px]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.65_0.2_275)] to-[oklch(0.5_0.2_275)] shadow-lg shadow-[oklch(0.65_0.2_275/0.3)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[oklch(0.98_0_0)]">
            AI Task Breakdown
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[oklch(0.65_0_0)] transition hover:text-[oklch(0.98_0_0)]"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[oklch(0.98_0_0)] px-4 py-2 text-sm font-semibold text-[oklch(0.12_0.005_285)] shadow-sm transition hover:bg-[oklch(0.85_0_0)]"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pt-20 pb-16 text-center lg:pt-32">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.65_0.2_275/0.3)] bg-[oklch(0.17_0.005_285/0.8)] px-4 py-1.5 text-xs font-semibold tracking-[0.16em] uppercase text-[oklch(0.65_0.2_275)] shadow-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Task Breakdown
        </p>
        
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-[oklch(0.98_0_0)] sm:text-6xl lg:text-7xl">
          Turn complex projects into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.65_0.2_275)] to-[oklch(0.85_0.1_275)]">
            actionable tasks.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[oklch(0.65_0_0)]">
          Describe your project or assignment in natural language, and let our LLM instantly decompose it into a structured, manageable workflow. Stop planning and start doing.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.65_0.2_275)] px-8 py-4 text-base font-semibold text-[oklch(0.98_0_0)] shadow-lg shadow-[oklch(0.65_0.2_275/0.4)] transition hover:brightness-110 sm:w-auto"
          >
            Start for free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/main"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[oklch(0.28_0.005_285)] bg-[oklch(0.17_0.005_285/0.5)] px-8 py-4 text-base font-semibold text-[oklch(0.98_0_0)] shadow-sm backdrop-blur-xl transition hover:bg-[oklch(0.22_0.005_285)] sm:w-auto"
          >
            Try the Demo
          </Link>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-[oklch(0.28_0.005_285)] bg-gradient-to-b from-[oklch(0.17_0.005_285/0.8)] to-[oklch(0.12_0.005_285/0.8)] p-8 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.65_0.2_275/0.1)] text-[oklch(0.65_0.2_275)]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[oklch(0.98_0_0)]">Conversational Edits</h3>
            <p className="text-sm leading-relaxed text-[oklch(0.65_0_0)]">
              Chat with your AI assistant to add, remove, or revise tasks on the fly without ever touching a form.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-[oklch(0.28_0.005_285)] bg-gradient-to-b from-[oklch(0.17_0.005_285/0.8)] to-[oklch(0.12_0.005_285/0.8)] p-8 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.7_0.18_250/0.1)] text-[oklch(0.7_0.18_250)]">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[oklch(0.98_0_0)]">Dynamic Views</h3>
            <p className="text-sm leading-relaxed text-[oklch(0.65_0_0)]">
              Toggle instantly between structured List views and Kanban boards to visualize your workflow exactly how you want.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-[oklch(0.28_0.005_285)] bg-gradient-to-b from-[oklch(0.17_0.005_285/0.8)] to-[oklch(0.12_0.005_285/0.8)] p-8 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.7_0.18_145/0.1)] text-[oklch(0.7_0.18_145)]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[oklch(0.98_0_0)]">Track & Export</h3>
            <p className="text-sm leading-relaxed text-[oklch(0.65_0_0)]">
              Track priority levels and time estimates. Export your entire generated task list to PDF or JSON for external use.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}