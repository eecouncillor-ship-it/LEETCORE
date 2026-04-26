"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  submitAnswerAction,
  type SubmissionState,
} from "@/app/problems/[id]/actions";

const initialState: SubmissionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-300"
      disabled={pending}
    >
      {pending ? "Submitting..." : "Submit answer"}
    </button>
  );
}

export function SubmissionForm({
  slug,
  options,
}: {
  slug: string;
  options: Array<{ id: string; text: string }>;
}) {
  const submitWithSlug = submitAnswerAction.bind(null, slug);
  const [state, formAction] = useActionState(submitWithSlug, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Answer panel
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">
            Select one option
          </h3>
        </div>
        <SubmitButton />
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 transition hover:border-orange-300 hover:bg-orange-50/50"
          >
            <input
              type="radio"
              name="selectedOptionId"
              value={option.id}
              className="mt-1 size-4"
            />
            <div>
              <p className="font-semibold text-slate-950">
                {option.id}. {option.text}
              </p>
            </div>
          </label>
        ))}
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.result ? (
        <div
          className={`rounded-[28px] border px-5 py-5 ${
            state.result.isCorrect
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p
            className={`text-sm font-semibold uppercase tracking-[0.18em] ${
              state.result.isCorrect ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {state.result.isCorrect ? "Correct answer" : "Incorrect answer"}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-800">
            You selected <span className="font-semibold">{state.result.selectedOptionId}</span>
            {" - "}
            {state.result.selectedOptionText}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-800">
            Correct answer:{" "}
            <span className="font-semibold">
              {state.result.correctOptionId} - {state.result.correctOptionText}
            </span>
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {state.result.solutionExplanation}
          </p>
        </div>
      ) : null}
    </form>
  );
}
