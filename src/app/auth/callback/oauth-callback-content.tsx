"use client";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { bridgeOAuthSession } from "@/app/auth/actions";

/** Survives Strict Mode remounts / clients that strip the URL after the first tick. */
const OAUTH_CODE_STASH_KEY = "corearena_oauth_pkce_code";

function mergeOAuthParams(): URLSearchParams {
  const merged = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    const fromHash = new URLSearchParams(hash);
    fromHash.forEach((value, key) => {
      if (!merged.has(key)) merged.set(key, value);
    });
  }
  return merged;
}

function decodeOAuthDescription(raw: string | null): string | undefined {
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw.replace(/\+/g, " ");
  }
}

export function OAuthCallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const params = mergeOAuthParams();
    const err = params.get("error");
    const errDesc = decodeOAuthDescription(params.get("error_description"));

    if (err) {
      sessionStorage.removeItem(OAUTH_CODE_STASH_KEY);
      setStatus("error");
      setMessage(
        errDesc || err || "Google sign-in did not complete.",
      );
      return;
    }

    let code = params.get("code");
    if (code) {
      sessionStorage.setItem(OAUTH_CODE_STASH_KEY, code);
    } else {
      code = sessionStorage.getItem(OAUTH_CODE_STASH_KEY);
    }

    const accessTokenFromUrl = params.get("access_token");

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

      const supabase = createClient(url, key, {
        auth: {
          flowType: "pkce",
        },
      });

      let accessToken: string | null = accessTokenFromUrl;

      if (!accessToken && code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          const {
            data: { session: recovered },
          } = await supabase.auth.getSession();
          if (recovered?.access_token) {
            accessToken = recovered.access_token;
          } else if (!cancelled) {
            sessionStorage.removeItem(OAUTH_CODE_STASH_KEY);
            setStatus("error");
            setMessage(
              exchangeError.message ||
                "Could not verify Google sign-in. Try again.",
            );
          }
          if (!accessToken) return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = accessToken ?? session?.access_token ?? null;

      if (!token) {
        if (!cancelled) {
          sessionStorage.removeItem(OAUTH_CODE_STASH_KEY);
          setStatus("error");
          setMessage(
            code || accessTokenFromUrl
              ? "No session returned after Google sign-in."
              : "Missing authorization code. Start sign-in again from the login page. If you use a Vercel preview URL, add it under Supabase Authentication redirect URLs (or use a wildcard like https://*.vercel.app/auth/callback).",
          );
        }
        return;
      }

      const result = await bridgeOAuthSession(token);

      if (cancelled) return;

      if (result.ok) {
        sessionStorage.removeItem(OAUTH_CODE_STASH_KEY);
        router.replace(result.role === "admin" ? "/admin" : "/problems");
        return;
      }

      sessionStorage.removeItem(OAUTH_CODE_STASH_KEY);
      setStatus("error");
      setMessage("Could not start your session. Please try again.");
    }

    void run();

    return () => {
      cancelled = true;
    };
    // Read window.location after mount; stash PKCE code so remounts still work (e.g. React Strict Mode).
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#08111f_35%,_#0f172a_100%)] px-6 py-16 text-center text-slate-100">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
        Corearena
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
