import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import AnimatedLanding from "@/components/animated-landing";
import { getCurrentUser } from "@/lib/auth";
import { getPublishedProblems, getStats } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [user, stats, problems] = await Promise.all([
    getCurrentUser(),
    getStats(),
    getPublishedProblems(),
  ]);

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/problems");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#08111f_35%,_#0f172a_100%)] text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 shadow-[0_10px_40px_rgba(2,6,23,0.4)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
              CodeArena
            </p>
            <p className="text-sm text-slate-400">
              MCQ practice platform with admin and student portals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#signin"
              suppressHydrationWarning
              className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Sign in
            </a>
            <Link
              href="/register"
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-sky-400/40 hover:text-white"
            >
              Register
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-1">
          <AnimatedLanding />
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-8 min-h-[64vh]">
            <div className="flex flex-col items-center gap-8 w-full">
              <h1
                id="leetcore-title"
                className="text-[4.5rem] sm:text-[6rem] md:text-[7.5rem] lg:text-[8.5rem] font-black tracking-tight text-white leading-none text-center"
              >
                LEETCORE
              </h1>

              <img
                id="hero-illustration"
                src="/hero-illustration.svg"
                alt="hero illustration"
                className="w-[86%] max-w-[720px] rounded-2xl shadow-lg mx-auto"
              />
            </div>
            <div
              id="signin"
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92)_0%,_rgba(2,6,23,0.92)_100%)] p-6 shadow-[0_35px_90px_rgba(2,6,23,0.42)] opacity-0 translate-y-6 transition-all duration-500 mx-auto"
            >
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                  Unified entry
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">Sign in to CodeArena</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  One screen for both the product overview and login.
                </p>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
