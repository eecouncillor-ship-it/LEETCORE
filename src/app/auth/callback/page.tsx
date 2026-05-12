import { Suspense } from "react";

import { OAuthCallbackContent } from "./oauth-callback-content";

export const dynamic = "force-dynamic";

function CallbackFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#08111f_35%,_#0f172a_100%)] px-6 py-16 text-center text-slate-100">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
        Corearena
      </p>
      <h1 className="mt-4 text-xl font-bold text-white">Signing you in…</h1>
      <p className="mt-3 max-w-md text-sm text-slate-300">
        Completing Google sign-in.
      </p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
