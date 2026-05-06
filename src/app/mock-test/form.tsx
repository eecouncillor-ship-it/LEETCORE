"use client";

import React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { MockResultRecord } from "@/lib/types";
import { createMockAction, submitMockAction, type MockFormState } from "./actions";

import ClientTimer from "./timer";

const initial: MockFormState = {};

export function MockForm({ categories, results }: { categories: string[]; results: MockResultRecord[] }) {
  const [state, formAction] = useActionState(createMockAction, initial as MockFormState);
  // Always call the submit hook, but only use it when we have a session
  const [submitState, submitFormAction] = useActionState(submitMockAction, initial);
  const { pending } = useFormStatus();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [autoSubmitted, setAutoSubmitted] = React.useState(false);

  // If server returned session and problems, render the inline test UI
  if ('session' in state) {
    const sess = state.session;
    const problems = state.problems;

    const currentProblem = problems[currentQuestionIndex];
    const submitPending = pending || autoSubmitted;

    const handleAnswerChange = (questionId: string, optionId: string) => {
      setAnswers((prev) => ({ ...prev, [`answer_${questionId}`]: optionId }));
    };

    const handleBlankChange = (questionId: string, blankId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [`answer_${questionId}_${blankId}`]: value }));
    };

    const answeredQuestionCount = problems.reduce((count, problem) => {
      const baseKey = `answer_${problem.id}`;
      const isFill = problem.correct_answer === "FIB";
      const hasAnswer = isFill
        ? problem.options.some((opt) => Boolean(answers[`${baseKey}_${opt.id}`]))
        : Boolean(answers[baseKey]);
      return count + (hasAnswer ? 1 : 0);
    }, 0);

    const handleExpire = () => {
      if (autoSubmitted || submitPending) return;
      setAutoSubmitted(true);
      formRef.current?.requestSubmit();
    };

    const navigateQuestion = (index: number) => {
      if (index < 0 || index >= problems.length) return;
      setCurrentQuestionIndex(index);
    };

    return (
      <form ref={formRef} action={submitFormAction} className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <input type="hidden" name="sessionId" value={sess.id} />
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Question Palette</p>
              <p className="text-xs text-slate-500">Tap a number to jump.</p>
            </div>
            <div className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-200">{problems.length} total</div>
          </div>

          <div className="grid gap-3">
            {problems.map((problem, index) => {
              const baseKey = `answer_${problem.id}`;
              const isAnswered = problem.correct_answer === "FIB"
                ? problem.options.some((opt) => Boolean(answers[`${baseKey}_${opt.id}`]))
                : Boolean(answers[baseKey]);
              const status = isAnswered ? "answered" : "unanswered";
              const isActive = index === currentQuestionIndex;

              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => navigateQuestion(index)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? "border border-orange-400 bg-orange-500/10 text-white"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isActive
                        ? "bg-orange-500 text-slate-950"
                        : status === "answered"
                        ? "bg-emerald-500 text-white"
                        : "bg-white/10 text-slate-400"
                    }`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">Q{index + 1}</p>
                      <p className="truncate text-xs text-slate-500">{problem.topic}</p>
                    </div>
                  </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    status === "answered" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700 text-slate-400"
                  }`}>
                    {status}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
            <p className="font-semibold text-slate-200 mb-2">Legend</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-white/10" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Current</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Live Mock Test</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Question {currentQuestionIndex + 1}</h2>
                <p className="mt-2 text-sm text-slate-400">Attempted {answeredQuestionCount} / {problems.length} questions</p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 px-4 py-2 text-sm text-slate-200">
                Time remaining: <ClientTimer endTime={sess.expiresAt} onExpire={handleExpire} />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
              <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full bg-white/5 px-3 py-1">Topic: {currentProblem.topic}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">Question {currentQuestionIndex + 1} of {problems.length}</span>
              </div>
              <div className="prose prose-invert max-w-full text-slate-100">
                <h3 className="text-xl font-semibold">{currentProblem.title}</h3>
                {currentProblem.image_url ? (
                  <img
                    src={currentProblem.image_url}
                    alt={currentProblem.title}
                    className="mb-6 max-w-full h-auto rounded-xl"
                  />
                ) : null}
                <p>{currentProblem.description}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Answer panel</h3>
              <div className="mt-4 space-y-4">
                {currentProblem.correct_answer === "FIB" ? (
                  currentProblem.options.map((opt) => (
                    <label
                      key={opt.id}
                      className="block rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 transition hover:border-sky-400"
                    >
                      <span className="text-sm font-semibold text-white">Blank {opt.id}</span>
                      {opt.image_url ? (
                        <img
                          src={opt.image_url}
                          alt={`Option ${opt.id}`}
                          className="mb-2 max-w-full h-auto rounded-lg"
                        />
                      ) : null}
                      <input
                        type="text"
                        name={`answer_${currentProblem.id}_${opt.id}`}
                        value={answers[`answer_${currentProblem.id}_${opt.id}`] ?? ""}
                        onChange={(event) => handleBlankChange(currentProblem.id, opt.id, event.target.value)}
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                        placeholder={`Enter answer for blank ${opt.id}`}
                        autoComplete="off"
                      />
                    </label>
                  ))
                ) : (
                  currentProblem.options.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 transition hover:border-sky-400"
                    >
                      <input
                        type="radio"
                        name={`answer_${currentProblem.id}`}
                        value={opt.id}
                        checked={answers[`answer_${currentProblem.id}`] === opt.id}
                        onChange={() => handleAnswerChange(currentProblem.id, opt.id)}
                        className="h-5 w-5 text-sky-500"
                      />
                      <div>
                        {opt.image_url ? (
                          <img
                            src={opt.image_url}
                            alt={`Option ${opt.id}`}
                            className="mb-2 max-w-full h-auto rounded-lg"
                          />
                        ) : null}
                        <p className="text-sm font-semibold text-white">{opt.id}. {opt.text}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">Answered {answeredQuestionCount} of {problems.length} questions</div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigateQuestion(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => navigateQuestion(Math.min(problems.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === problems.length - 1}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition"
              >
                Next
              </button>
              <button
                type="submit"
                disabled={submitPending}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {submitPending ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>

          {('error' in submitState) && submitState.error ? (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {submitState.error}
            </div>
          ) : null}
        </main>
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">Topic</label>
        <select name="topic" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
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
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-3">Mock test history</h2>
        {results.length === 0 ? (
          <div className="text-sm text-slate-400">No mock tests taken yet.</div>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">{new Date(r.createdAt).toLocaleString()}</div>
                  <div className="text-sm font-semibold text-white">Score: {r.correct}/{r.total}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </form>
  );
}
