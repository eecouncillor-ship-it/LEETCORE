"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitMockAction, type MockFormState, type MinimalProblem } from "./actions";

const initial: MockFormState = {};

export function MockSessionForm({ sessionId, problems }: { sessionId: string; problems: MinimalProblem[] }) {
  const [state, formAction] = useActionState(submitMockAction, initial);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const currentProblem = problems[currentQuestionIndex];

  const answerFieldKey = (questionId: string) => `answer_${questionId}`;

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [answerFieldKey(questionId)]: value }));
  };

  const handleNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const clearCurrentSelection = () => {
    if (!currentProblem) return;
    const key = answerFieldKey(currentProblem.id);
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const currentHasSelection = currentProblem
    ? answers[answerFieldKey(currentProblem.id)] !== undefined
    : false;

  return (
    <form action={formAction} className="flex gap-6 h-full">
      <input type="hidden" name="sessionId" value={sessionId} />
      {Object.entries(answers).map(([fieldName, value]) =>
        value !== "" ? (
          <input key={fieldName} type="hidden" name={fieldName} value={value} />
        ) : null,
      )}

      {/* Left Sidebar - Question List */}
      <div className="w-64 flex-shrink-0 h-full overflow-hidden">
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden h-full flex flex-col">
          <div className="border-b border-white/10 px-4 py-4 flex-shrink-0">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Questions</h3>
          </div>
          <div className="divide-y divide-white/10 overflow-y-auto flex-1">
            {problems.map((problem, index) => {
              const isAnswered =
                answers[answerFieldKey(problem.id)] !== undefined;
              const isActive = index === currentQuestionIndex;

              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => handleNavigate(index)}
                  className={`w-full px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-orange-500/20 border-l-2 border-orange-500"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : isAnswered
                          ? "bg-emerald-500/30 text-emerald-300"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 text-xs min-w-0">
                      <p className="text-slate-200 font-medium truncate">Q{index + 1}</p>
                      <p className="text-slate-400 truncate text-xs">{problem.title}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Area - Question Viewer */}
      <div className="flex-1 overflow-y-auto">
        {currentProblem && (
          <div className="space-y-6 pr-4">
            {/* Question Header */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Q{currentQuestionIndex + 1}. {currentProblem.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold`}>
                      MCQ
                    </span>
                    <span className="text-xs text-slate-400">{currentProblem.topic}</span>
                  </div>
                </div>
              </div>

              {/* Question Description */}
              <div className="mt-4 text-sm text-slate-300 leading-relaxed">
                {currentProblem.description}
              </div>
            </div>

            {/* Options */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-200 uppercase tracking-wide">
                Options
              </h3>
              <div className="space-y-3">
                {currentProblem.options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-4 rounded-lg border border-white/10 px-4 py-3 cursor-pointer transition hover:bg-white/5"
                  >
                    <input
                      type="radio"
                      value={opt.id}
                      checked={
                        answers[answerFieldKey(currentProblem.id)] === opt.id
                      }
                      onChange={() =>
                        handleAnswerChange(currentProblem.id, opt.id)
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-slate-200">
                      <span className="font-semibold">{opt.id}.</span> {opt.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation and Submit */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate(Math.min(problems.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === problems.length - 1}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition"
                >
                  Next →
                </button>
                <button
                  type="button"
                  onClick={clearCurrentSelection}
                  disabled={!currentHasSelection}
                  className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear selection
                </button>
              </div>

              {currentQuestionIndex === problems.length - 1 && (
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition"
                >
                  Submit Test
                </button>
              )}
            </div>

            {/* Error Message */}
            {('error' in state) && state.error ? (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {state.error}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </form>
  );
}
