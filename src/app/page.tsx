import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import AnimatedLanding from "@/components/animated-landing";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/problems");
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,#010409_0%,#071525_42%,#0c1428_100%)]"
          aria-hidden
        />
        <div
          className="landing-blob absolute -right-[18%] top-[8%] h-[min(560px,85vw)] w-[min(560px,85vw)] rounded-full bg-sky-500/[0.22]"
          aria-hidden
        />
        <div
          className="landing-blob-delayed absolute -left-[12%] bottom-[18%] h-[min(480px,78vw)] w-[min(480px,78vw)] rounded-full bg-cyan-400/[0.14]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(56,189,248,0.15),transparent_52%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_90%,rgba(14,165,233,0.08),transparent_45%)]"
          aria-hidden
        />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="landing-animate-fade-up landing-nav-glow sticky top-6 z-50 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/[0.09] bg-slate-950/55 px-5 py-3 backdrop-blur-xl md:flex-nowrap">
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-white">Corearena</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/register"
              prefetch={false}
              className="rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400/45 hover:bg-white/[0.06] hover:text-white"
            >
              Register
            </Link>
            <a
              href="#signin"
              suppressHydrationWarning
              className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(14,165,233,0.55)] transition hover:brightness-110 hover:shadow-[0_12px_36px_-8px_rgba(14,165,233,0.65)]"
            >
              Sign in
            </a>
          </div>
        </header>

        <AnimatedLanding />

        <div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-1 lg:gap-16 lg:py-20">
          <div className="flex min-h-[56vh] flex-col items-center justify-center gap-10 lg:col-span-2">
            <div className="flex w-full max-w-4xl flex-col items-center gap-6 text-center">
              <p className="landing-animate-fade-up landing-delay-2 text-xs font-semibold uppercase tracking-[0.35em] text-sky-400/90">
                Built for depth · timed mocks · instant feedback
              </p>
              <h1
                id="leetcore-title"
                className="relative max-w-[95vw] bg-gradient-to-br from-white via-slate-100 to-sky-400 bg-clip-text text-[3.2rem] font-black leading-[0.95] tracking-tight text-transparent sm:text-[5rem] md:text-[6.25rem] lg:text-[7rem]"
              >
                LEETCORE
              </h1>
              <p className="landing-animate-fade-up landing-delay-3 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                Curated multiple-choice sets, realistic mock exams, and a calm workspace so you
                focus on mastery—not noise.
              </p>
              <div className="landing-animate-fade-up landing-delay-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  prefetch={false}
                  className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_36px_-12px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Start free
                </Link>
                <a
                  href="#signin"
                  suppressHydrationWarning
                  className="rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-400/40 hover:bg-white/[0.05] hover:text-white"
                >
                  I already have an account
                </a>
              </div>
            </div>

            <div
              id="hero-login-panel"
              className="landing-animate-scale-in landing-delay-3 relative w-full max-w-md px-2"
            >
              <div
                className="landing-shimmer-border pointer-events-none absolute -inset-[1px] rounded-[28px] opacity-60"
                aria-hidden
              />
              <div
                id="signin"
                className="relative rounded-[26px] border border-white/[0.1] bg-[linear-gradient(165deg,rgba(15,23,42,0.94)_0%,rgba(2,6,23,0.96)_55%,rgba(8,17,31,0.98)_100%)] p-7 shadow-[0_40px_100px_-28px_rgba(2,6,23,0.85)] ring-1 ring-white/[0.05]"
              >
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400/95">
                    Welcome back
                  </p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                    Sign in to Corearena
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    Secure entry for students and admins—same portal, role-aware routing after login.
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm">
                  <LoginForm />
                </div>
              </div>
            </div>

            <div className="landing-animate-fade-up landing-delay-5 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Smart question bank",
                  body: "Browse by topic and difficulty with explanations that stick.",
                },
                {
                  title: "Timed mock tests",
                  body: "Palette navigation and countdown that mirror real pressure.",
                },
                {
                  title: "Progress you can trust",
                  body: "History and accuracy visible without clutter.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="landing-card-hover rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 text-left"
                >
                  <div className="mb-3 h-px w-10 rounded-full bg-gradient-to-r from-sky-400 to-transparent" />
                  <h3 className="text-sm font-bold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="landing-animate-fade-up mt-auto border-t border-white/[0.06] py-8 text-center text-xs text-slate-500">
          Corearena · Practice with intention
        </footer>
      </section>
    </main>
  );
}
