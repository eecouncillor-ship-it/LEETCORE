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
      ? updateProblemAction.bind(null, problem.id)
      : createProblemAction;

  const [state, formAction] = useActionState(action, initialState);
  const optionMap = new Map(problem?.options.map((option) => [option.id, option.text]) ?? []);
  const [kind, setKind] = React.useState<"mcq" | "fib">("mcq");
  const [questionImage, setQuestionImage] = React.useState<string>(problem?.image_url ?? "");
  const [optionImages, setOptionImages] = React.useState<string[]>([
    problem?.options?.[0]?.image_url ?? "",
    problem?.options?.[1]?.image_url ?? "",
    problem?.options?.[2]?.image_url ?? "",
    problem?.options?.[3]?.image_url ?? "",
  ]);

  const uploadFile = async (file: File) => {
    console.log("Uploading file:", file.name);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Upload result:", data);

    if (!res.ok || !data.url) {
      throw new Error(data?.error || "Upload failed");
    }

    return data.url;
  };

  const handleQuestionImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Uploading question image", file.name);
    try {
      const url = await uploadFile(file);
      setQuestionImage(url);
    } catch (error) {
      console.error("Question image upload failed", error);
    }
  };

  const handleOptionImage = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Uploading option", index, file.name);
    try {
      const url = await uploadFile(file);
      setOptionImages((current) => {
        const updated = [...current];
        updated[index] = url;
        return updated;
      });
    } catch (error) {
      console.error(`Option ${index} upload failed`, error);
    }
  };

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="questionImageUrl" value={questionImage} />
      <input type="hidden" name="optionAImageUrl" value={optionImages[0] ?? ""} />
      <input type="hidden" name="optionBImageUrl" value={optionImages[1] ?? ""} />
      <input type="hidden" name="optionCImageUrl" value={optionImages[2] ?? ""} />
      <input type="hidden" name="optionDImageUrl" value={optionImages[3] ?? ""} />
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
            Topic
          </label>
          <select
            name="topic"
            required
            defaultValue={(problem as any)?.topic ?? ""}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
          >
            <option value="">Select Topic</option>
            <option value="DSA">DSA</option>
            <option value="SQL">SQL</option>
            <option value="DBMS">DBMS</option>
            <option value="OS">OS</option>
            <option value="CN">CN</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Difficulty
          </label>
          <select
            name="difficulty"
            required
            defaultValue={(problem as any)?.difficulty ?? ""}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
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
          <input
            type="file"
            accept="image/*"
            className="text-sm text-slate-200"
            onChange={handleQuestionImage}
          />
          {questionImage ? (
            <img
              src={questionImage}
              alt="Question image"
              className="mt-3 max-w-full h-auto rounded-xl"
            />
          ) : null}
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
            <input
              type="file"
              accept="image/*"
              className="text-sm text-slate-200"
              onChange={(e) => handleOptionImage(0, e)}
            />
            {optionImages[0] ? (
              <img
                src={optionImages[0]}
                alt="Option A image"
                className="mt-3 max-w-full h-auto rounded-lg"
              />
            ) : null}
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
            <input
              type="file"
              accept="image/*"
              className="text-sm text-slate-200"
              onChange={(e) => handleOptionImage(1, e)}
            />
            {optionImages[1] ? (
              <img
                src={optionImages[1]}
                alt="Option B image"
                className="mt-3 max-w-full h-auto rounded-lg"
              />
            ) : null}
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
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm text-slate-200"
                  onChange={(e) => handleOptionImage(2, e)}
                />
                {optionImages[2] ? (
                  <img
                    src={optionImages[2]}
                    alt="Option C image"
                    className="mt-3 max-w-full h-auto rounded-lg"
                  />
                ) : null}
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
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm text-slate-200"
                  onChange={(e) => handleOptionImage(3, e)}
                />
                {optionImages[3] ? (
                  <img
                    src={optionImages[3]}
                    alt="Option D image"
                    className="mt-3 max-w-full h-auto rounded-lg"
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Answer</label>
            <input name="fibAnswer" required={kind === "fib"} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400" defaultValue={(problem as any)?.answer ?? ""} />
            <div className="mt-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">Attach photo (answer)</label>
              <input type="file" accept="image/*" className="text-sm text-slate-200" />
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
              defaultValue={problem?.correct_answer ?? "A"}
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
            defaultValue={problem?.explanation ?? ""}
            className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-100 outline-none transition focus:border-orange-400"
            placeholder="Explain why the correct option is right so students learn immediately after submitting."
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={mode === "edit" ? "Save changes" : "Create question"} />
    </form>
  );
}
