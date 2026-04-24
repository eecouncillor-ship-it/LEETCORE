"use client";

import React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createProblemAction,
  updateProblemAction,
  type QuestionFormState,
} from "@/app/admin/actions";
import type { ProblemRecord } from "@/lib/types";

const initialState: QuestionFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

type QuestionFormProps = {
  mode?: "create" | "edit";
  problem?: ProblemRecord;
};

export function CreateProblemForm({
  mode = "create",
  problem,
}: QuestionFormProps) {
  const action =
    mode === "edit" && problem
      ? updateProblemAction.bind(null, problem.slug)
      : createProblemAction;

  const [state, formAction] = useActionState(action, initialState);
  const optionMap = new Map(problem?.options.map((option) => [option.id, option.text]) ?? []);
  const [kind, setKind] = React.useState<"mcq" | "fib">((problem?.kind as any) ?? "mcq");

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Question title
          </label>
          <input
            name="title"
            required
            defaultValue={problem?.title ?? ""}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
            placeholder="Big O of Merge Sort"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Category
          </label>
          <input
            name="category"
            required
            defaultValue={problem?.category ?? ""}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
            placeholder="Algorithms"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[180px_1fr]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Difficulty
          </label>
          <select
            name="difficulty"
            defaultValue={problem?.difficulty ?? "Easy"}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Tags
          </label>
          <input
            name="tags"
            defaultValue={problem?.tags.join(", ") ?? ""}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
            placeholder="algorithms, sorting, complexity"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Question description
        </label>
        <textarea
          name="description"
          required
          rows={7}
          defaultValue={problem?.description ?? ""}
          className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-100 outline-none transition focus:border-orange-400"
          placeholder="Write the full multiple-choice question students should see..."
        />
        <div className="mt-3">
          <label className="mb-2 block text-sm font-semibold text-slate-200">Attach photo (description)</label>
          <input name="photoDescription" type="file" accept="image/*" className="text-sm text-slate-200" />
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="radio" name="kind" value="mcq" checked={kind === "mcq"} onChange={() => setKind("mcq")} />
          MCQ
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="radio" name="kind" value="fib" checked={kind === "fib"} onChange={() => setKind("fib")} />
          Fill in the blank
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Option A
          </label>
          <input
            name="optionA"
            required={kind === "mcq"}
            defaultValue={optionMap.get("A") ?? ""}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
            placeholder="O(n)"
          />
          <div className="mt-2">
            <label className="mb-2 block text-sm font-semibold text-slate-200">Attach photo (option A)</label>
            <input name="photoOptionA" type="file" accept="image/*" className="text-sm text-slate-200" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Option B
          </label>
          <input
            name="optionB"
            required={kind === "mcq"}
            defaultValue={optionMap.get("B") ?? ""}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
            placeholder="O(log n)"
          />
          <div className="mt-2">
            <label className="mb-2 block text-sm font-semibold text-slate-200">Attach photo (option B)</label>
            <input name="photoOptionB" type="file" accept="image/*" className="text-sm text-slate-200" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {kind === "mcq" ? (
          <>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Option C</label>
              <input
                name="optionC"
                required
                defaultValue={optionMap.get("C") ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
                placeholder="O(n log n)"
              />
              <div className="mt-2">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Attach photo (option C)</label>
                <input name="photoOptionC" type="file" accept="image/*" className="text-sm text-slate-200" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Option D</label>
              <input
                name="optionD"
                required
                defaultValue={optionMap.get("D") ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
                placeholder="O(1)"
              />
              <div className="mt-2">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Attach photo (option D)</label>
                <input name="photoOptionD" type="file" accept="image/*" className="text-sm text-slate-200" />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Answer</label>
            <input name="fibAnswer" required={kind === "fib"} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400" defaultValue={(problem as any)?.answer ?? ""} />
            <div className="mt-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">Attach photo (answer)</label>
              <input name="photoFib" type="file" accept="image/*" className="text-sm text-slate-200" />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        {kind === "mcq" ? (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Correct option</label>
            <select
              name="correctOptionId"
              defaultValue={problem?.correctOptionId ?? "A"}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
            >
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>
        ) : null}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Solution explanation
          </label>
          <textarea
            name="solutionExplanation"
            required
            rows={4}
            defaultValue={problem?.solutionExplanation ?? ""}
            className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-100 outline-none transition focus:border-orange-400"
            placeholder="Explain why the correct option is right so students learn immediately after submitting."
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Constraints or notes</label>
        <textarea
          name="constraints"
          rows={5}
          defaultValue={problem?.constraints.join("\n") ?? ""}
          className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-orange-400"
          placeholder="One fact per line&#10;Assume standard SQL syntax"
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={problem?.published ?? true}
          className="size-4"
        />
        Publish immediately so students can answer this question
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={mode === "edit" ? "Save changes" : "Create question"} />
    </form>
  );
}
