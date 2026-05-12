import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = 'force-dynamic';

function loginOAuthErrorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined;
  const messages: Record<string, string> = {
    oauth_missing_code:
      "The sign-in link was incomplete. Please try Google sign-in again.",
    oauth_exchange:
      "Google sign-in could not be verified. Please try again.",
    oauth_no_email:
      "Your Google account did not return an email. Use another method or check Google permissions.",
    invalid_session:
      "Your Google session could not be verified. Please sign in again.",
  };
  return messages[code] ?? code.replace(/_/g, " ");
}

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const oauthError = loginOAuthErrorMessage(params.error);

  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/problems");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#08111f_35%,_#0f172a_100%)] text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12 sm:px-10 lg:px-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">Corearena</p>
            <p className="text-sm text-slate-400">Sign in to your account</p>
          </div>
          <div>
            <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Back</Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Login</p>
              <h2 className="mt-2 text-2xl font-black text-white">Sign in to your account</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">Access your dashboard and continue solving problems.</p>
            </div>

            <LoginForm oauthError={oauthError} />
          </div>
        </div>
      </section>
    </main>
  );
}
