import { ResetForm } from "../reset-form";
import { getPasswordReset } from "@/lib/db";
import { notFound } from "next/navigation";

type ResetPageProps = {
  params: Promise<{ token: string }>
};

export default async function ResetPage({ params }: ResetPageProps) {
  const { token } = await params;
  const reset = await getPasswordReset(token);
  if (!reset || new Date(reset.expiresAt).getTime() < Date.now()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%)] text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-6">Reset password</h1>
        <div className="rounded-[20px] border border-white/10 bg-white/5 p-6">
          <p className="mb-4 text-sm text-slate-300">Enter a new password for your account.</p>
          {/* @ts-ignore server -> client prop passing is fine for simple token string */}
          <ResetForm token={token} />
        </div>
      </section>
    </main>
  );
}
