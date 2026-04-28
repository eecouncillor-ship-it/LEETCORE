"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createMockAction, submitMockAction, type MockFormState } from "./actions";

import ClientTimer from "./timer";

const initial: MockFormState = {};

export function MockForm({ categories }: { categories: string[] }) {
  const [state, formAction] = useActionState(createMockAction, initial as MockFormState);
  // Always call the submit hook, but only use it when we have a session
  const [submitState, submitFormAction] = useActionState(submitMockAction, initial);
  const { pending } = useFormStatus();

  // If server returned session and problems, render the inline test UI
  if ((state as any).session) {
    const sess = (state as any).session as any;
    const problems = (state as any).problems as any[];

    // Debug logging
    console.log('[FORM] Mock test session object:', sess);
    console.log('[FORM] Session expiresAt:', sess.expiresAt);
    console.log('[FORM] Session expires_at (wrong key):', (sess as any).expires_at);
    console.log('[FORM] All session keys:', Object.keys(sess));
    console.log('[FORM] Session field types:', {
      id: typeof sess.id,
      userId: typeof sess.userId,
      problemIds: typeof sess.problemIds,
      startedAt: typeof sess.startedAt,
      expiresAt: typeof sess.expiresAt,
      createdAt: typeof sess.createdAt,
    });

    const submitPending = (submitState as any).pending || false;

    return (
      <div>
        <div className="mb-4">
          <ClientTimer endTime={sess.expiresAt} />
        </div>

        <form action={submitFormAction} className="space-y-6">
          <input type="hidden" name="sessionId" value={sess.id} />
          {problems.map((p, idx) => (
            <section key={p.id} className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold text-white">{idx + 1}. {p.title}</h3>
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

          {('error' in submitState) && submitState.error ? <div className="text-sm text-rose-500">{submitState.error}</div> : null}

          <div className="flex justify-end">
            <button type="submit" disabled={submitPending} className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white">{submitPending ? "Submitting..." : "Submit Mock Test"}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">Topic</label>
        <select name="category" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
          <option value="">All Topics</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">Number of questions</label>
        <input name="count" defaultValue={5} type="number" min={1} max={50} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">Duration (minutes)</label>
        <input name="duration" defaultValue={10} type="number" min={1} max={180} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100" />
      </div>

      {('error' in state) && state.error ? <div className="text-sm text-rose-500">{state.error}</div> : null}

      <button type="submit" disabled={pending} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white">
        {pending ? "Creating..." : "Start Mock Test"}
      </button>
    </form>
  );
}
