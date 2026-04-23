"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { verifyRegistrationAction, type VerifyState } from "./verify-action";

const initial: VerifyState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending ? "Verifying..." : "Verify OTP"}
    </button>
  );
}

export function VerifyForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(verifyRegistrationAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">OTP</label>
        <input name="otp" required className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none" />
      </div>

      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}

      <SubmitButton />
    </form>
  );
}
