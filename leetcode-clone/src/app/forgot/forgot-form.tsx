"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { forgotAction, type ForgotState } from "./actions";

const initial: ForgotState = {};

export function ForgotForm() {
  const [state, formAction] = useActionState(forgotAction, initial);
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
        <input name="email" type="email" required className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100" />
      </div>

      {state.error ? <p className="text-sm text-rose-500">{state.error}</p> : null}

      {state.token ? (
        <p className="text-sm text-emerald-300">Reset link: <a className="underline" href={`/reset/${state.token}`}>Open reset page</a></p>
      ) : null}

      <button type="submit" className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white" disabled={pending}>{pending ? 'Sending...' : 'Send reset link'}</button>
    </form>
  );
}
