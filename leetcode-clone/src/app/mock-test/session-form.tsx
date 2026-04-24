"use client";

import React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitMockAction, type MockFormState } from "./actions";

const initial: MockFormState = {};

export function MockSessionForm({ sessionId, problems }: { sessionId: string; problems: any[] }) {
  const [state, formAction] = useActionState(submitMockAction, initial);
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="sessionId" value={sessionId} />

      {problems.map((p) => (
        <section key={p.id} className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-base font-semibold text-white">{p.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{p.description}</p>
          <div className="mt-3 grid gap-2">
            {p.options.map((opt: any) => (
              <label key={opt.id} className="flex items-center gap-3">
                <input type="radio" name={`answer_${p.id}`} value={opt.id} required />
                <span className="text-slate-100">{opt.id}. {opt.text}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      {('error' in state) && state.error ? <div className="text-sm text-rose-500">{state.error}</div> : null}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white">{pending ? "Submitting..." : "Submit Mock Test"}</button>
      </div>
    </form>
  );
}
