"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { resetPasswordAction, type ResetState } from "./actions";

const initial: ResetState = {};

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initial);
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">New password</label>
        <input name="password" type="password" required className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
        <input name="confirm" type="password" required className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100" />
      </div>

      {state.error ? <p className="text-sm text-rose-500">{state.error}</p> : null}

      <button type="submit" className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white" disabled={pending}>{pending ? 'Resetting...' : 'Reset password'}</button>
    </form>
  );
}
