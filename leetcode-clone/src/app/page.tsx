import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/auth";
import { getPublishedProblems, getStats } from "@/lib/db";

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
              className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Sign in
            </a>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-200 shadow-sm">
              Built for assessments, training, and campus testing
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl">
                Launch a darker, sharper quiz platform where admins manage the bank and students track progress.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Publish questions from the admin side, let students answer them
                from a clean dashboard, and keep a live record of submissions,
                solved questions, and progress across the platform.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
                <p className="text-3xl font-black text-white">
                  {stats.totalProblems}
                </p>
                <p className="mt-2 text-sm text-slate-400">Published questions</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
                <p className="text-3xl font-black text-white">
                  {stats.totalSubmissions}
                </p>
                <p className="mt-2 text-sm text-slate-400">Recorded submissions</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
                <p className="text-3xl font-black text-white">2</p>
                <p className="mt-2 text-sm text-slate-400">Role-based portals</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.3)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-sky-300">
                    Platform preview
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Live student question bank
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  Dashboard ready
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {problems.slice(0, 3).map((problem, index) => (
                  <div
                    key={problem.id}
                    className="rounded-2xl border border-white/8 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          Question {index + 1}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-white">
                          {problem.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                        {problem.difficulty}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                      {problem.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            id="signin"
            className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92)_0%,_rgba(2,6,23,0.92)_100%)] p-8 shadow-[0_35px_90px_rgba(2,6,23,0.42)]"
          >
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                Unified entry
              </p>
              <h2 className="mt-3 text-3xl font-black text-white">
                Sign in to CodeArena
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                One screen for both the product overview and login. Use the demo
                credentials below to enter the correct workspace.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Admin login
                </p>
                <p className="mt-4 text-sm text-slate-200">
                  <span className="font-semibold">Email:</span> admin@codearena.dev
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  <span className="font-semibold">Password:</span> admin123
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Student login
                </p>
                <p className="mt-4 text-sm text-slate-200">
                  <span className="font-semibold">Email:</span> student@codearena.dev
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  <span className="font-semibold">Password:</span> student123
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <LoginForm />
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
              <Link
                href="/admin"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-sky-400/40 hover:text-white"
              >
                Admin features
              </Link>
              <Link
                href="/problems"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-sky-400/40 hover:text-white"
              >
                Student dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
