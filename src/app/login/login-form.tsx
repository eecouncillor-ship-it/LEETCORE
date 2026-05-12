"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type LoginState } from "@/app/login/actions";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      suppressHydrationWarning
      className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

type LoginFormProps = {
  oauthError?: string;
};

export function LoginForm({ oauthError }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="space-y-6">
      <GoogleSignInButton label="Continue with Google" />

      <div className="relative flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Or email
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

    <form action={formAction} className="space-y-4">
      {oauthError ? (
        <p className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {oauthError}
        </p>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          placeholder="student@codearena.dev"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          placeholder="Enter your password"
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
          <div className="mt-2 text-sm text-slate-300">
            <a href="/forgot" className="underline">Forgot password?</a>
          </div>
    </form>
    </div>
  );
}
