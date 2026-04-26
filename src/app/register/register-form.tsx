"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending ? "Registering..." : "Register"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          pattern=".+@smail\.iitm\.ac\.in"
          title="Email must end with @smail.iitm.ac.in"
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
          placeholder="you@smail.iitm.ac.in"
        />
        <p className="mt-2 text-xs text-slate-500">Use your institutional email (example: name@smail.iitm.ac.in)</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
          placeholder="Choose a password"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
        <input
          name="confirm"
          type="password"
          required
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
          placeholder="Repeat your password"
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</p>
      ) : null}

      {/* no OTP flow: registration completes immediately and redirects */}

      <SubmitButton />
    </form>
  );
}
