import { ForgotForm } from "./forgot-form";

export default function ForgotPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%)] text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-6">Forgot password</h1>
        <div className="rounded-[20px] border border-white/10 bg-white/5 p-6">
          <p className="mb-4 text-sm text-slate-300">Enter your email and we'll provide a reset link.</p>
          <ForgotForm />
        </div>
      </section>
    </main>
  );
}
