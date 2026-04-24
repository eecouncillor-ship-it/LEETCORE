import { RegisterForm } from "./register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#08111f_35%,_#0f172a_100%)] text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12 sm:px-10 lg:px-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">CodeArena</p>
            <p className="text-sm text-slate-400">Create a student account</p>
          </div>
          <div>
            <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Back</Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Register</p>
              <h2 className="mt-2 text-2xl font-black text-white">Create your student account</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">Register to start solving questions and track your progress.</p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
