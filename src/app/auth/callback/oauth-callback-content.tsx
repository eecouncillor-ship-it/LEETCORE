"use client";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { bridgeOAuthSession } from "@/app/auth/actions";

export function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const code = searchParams.get("code");
    const err = searchParams.get("error");
    const errDesc = searchParams.get("error_description");

    if (err) {
      setStatus("error");
      setMessage(
        errDesc?.replace(/\+/g, " ") ||
          err ||
          "Google sign-in did not complete.",
      );
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("Missing authorization code. Start sign-in again from the login page.");
      return;
    }

    const authCode = code;

    let cancelled = false;

    async function run() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        if (!cancelled) {
          setStatus("error");
          setMessage("Authentication is not configured.");
        }
        return;
      }

      const supabase = createClient(url, key);
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(authCode);

      if (exchangeError) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            exchangeError.message ||
              "Could not verify Google sign-in. Try again.",
          );
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        if (!cancelled) {
          setStatus("error");
          setMessage("No session returned after Google sign-in.");
        }
        return;
      }

      const result = await bridgeOAuthSession(session.access_token);

      if (cancelled) return;

      if (result.ok) {
        router.replace(result.role === "admin" ? "/admin" : "/problems");
        return;
      }

      setStatus("error");
      setMessage("Could not start your session. Please try again.");
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#08111f_35%,_#0f172a_100%)] px-6 py-16 text-center text-slate-100">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
        CodeArena
      </p>
      <h1 className="mt-4 text-xl font-bold text-white">
        {status === "working" ? "Signing you in" : "Sign-in issue"}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
        {message}
      </p>
      {status === "error" ? (
        <Link
          href="/login"
          className="mt-8 rounded-full border border-white/15 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Back to login
        </Link>
      ) : null}
    </main>
  );
}
