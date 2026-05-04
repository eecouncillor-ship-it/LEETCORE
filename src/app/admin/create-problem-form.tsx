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
  type OptionState = {
    id: string;
    text: string;
    image_url?: string;
  };

  const defaultOptions: OptionState[] = [
    { id: "A", text: "", image_url: problem?.options?.[0]?.image_url },
    { id: "B", text: "", image_url: problem?.options?.[1]?.image_url },
    { id: "C", text: "", image_url: problem?.options?.[2]?.image_url },
    { id: "D", text: "", image_url: problem?.options?.[3]?.image_url },
  ];

  const action =
    mode === "edit" && problem
      ? updateProblemAction.bind(null, problem.id)
      : createProblemAction;

  const [state, formAction] = useActionState(action, initialState);
  const [kind, setKind] = React.useState<"mcq" | "fib">(
    problem?.correct_answer === "FIB" ? "fib" : "mcq"
  );
  const [questionImage, setQuestionImage] = React.useState<string>(problem?.image_url ?? "");
  const knownTopics = ["DSA", "SQL", "DBMS", "OS", "CN"];
  const isKnownTopic = problem && knownTopics.includes(problem.topic);
  const [selectedTopic, setSelectedTopic] = React.useState<string>(
    problem?.topic ? (isKnownTopic ? problem.topic : "new") : ""
  );
  const [customTopic, setCustomTopic] = React.useState<string>(
    problem && !isKnownTopic ? problem.topic : ""
  );
  const [options, setOptions] = React.useState<OptionState[]>(
    problem?.options?.map((option) => ({
      id: option.id,
      text: option.text,
      image_url: option.image_url ?? undefined,
    })) ?? defaultOptions
  );
  const [fibBlanks, setFibBlanks] = React.useState<OptionState[]>(
    problem?.correct_answer === "FIB"
      ? problem.options.map((option) => ({ id: option.id, text: option.text }))
      : [{ id: "A", text: "" }]
  );
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState<boolean>(false);

  const updateOption = (index: number, patch: Partial<OptionState>) => {
    setOptions((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const uploadFile = async (file: File) => {
    console.log("Uploading file:", file.name);
    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setUploadError(message);
      throw error;
    } finally {
      setUploading(false);
    }
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
      updateOption(index, { image_url: url });
    } catch (error) {
      console.error(`Option ${index} upload failed`, error);
    }
  };

  const optionData = kind === "fib" ? fibBlanks : options;

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="questionImageUrl" value={questionImage} />
      <input type="hidden" name="optionsJson" value={JSON.stringify(optionData)} />
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
            value={selectedTopic}
            onChange={(event) => setSelectedTopic(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
          >
            <option value="">Select Topic</option>
            <option value="DSA">DSA</option>
            <option value="SQL">SQL</option>
            <option value="DBMS">DBMS</option>
            <option value="OS">OS</option>
            <option value="CN">CN</option>
            <option value="new">Add new topic</option>
          </select>
          {selectedTopic === "new" ? (
            <input
              name="customTopic"
              required
              value={customTopic}
              onChange={(event) => setCustomTopic(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
              placeholder="Enter custom topic"
            />
          ) : null}
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
          <input
            type="radio"
            name="kind"
            value="mcq"
            checked={kind === "mcq"}
            onChange={() => {
              setKind("mcq");
              if (options.length !== 4) {
                setOptions(defaultOptions);
              }
            }}
          />
          MCQ
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="radio"
            name="kind"
            value="fib"
            checked={kind === "fib"}
            onChange={() => setKind("fib")}
          />
          Fill in the blank
        </label>
      </div>

      {kind === "mcq" ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Option A
              </label>
              <input
                name="optionA"
                required
                value={options[0]?.text ?? ""}
                onChange={(e) => updateOption(0, { text: e.target.value })}
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
                {options[0]?.image_url ? (
                  <img
                    src={options[0].image_url}
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
                required
                value={options[1]?.text ?? ""}
                onChange={(e) => updateOption(1, { text: e.target.value })}
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
                {options[1]?.image_url ? (
                  <img
                    src={options[1].image_url}
                    alt="Option B image"
                    className="mt-3 max-w-full h-auto rounded-lg"
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Option C</label>
              <input
                name="optionC"
                required
                value={options[2]?.text ?? ""}
                onChange={(e) => updateOption(2, { text: e.target.value })}
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
                {options[2]?.image_url ? (
                  <img
                    src={options[2].image_url}
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
                value={options[3]?.text ?? ""}
                onChange={(e) => updateOption(3, { text: e.target.value })}
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
                {options[3]?.image_url ? (
                  <img
                    src={options[3].image_url}
                    alt="Option D image"
                    className="mt-3 max-w-full h-auto rounded-lg"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-5">
          <label className="mb-2 block text-sm font-semibold text-slate-200">Fill in the blank answers</label>
          {fibBlanks.map((blank, index) => (
            <div key={blank.id} className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-200">Blank {blank.id}</span>
                {fibBlanks.length > 1 ? (
                  <button
                    type="button"
                    className="text-sm text-orange-300 hover:text-orange-100"
                    onClick={() => {
                      setFibBlanks((current) => current.filter((_, i) => i !== index));
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                name={`blank_${blank.id}`}
                required
                value={blank.text}
                onChange={(e) => {
                  const nextText = e.target.value;
                  setFibBlanks((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, text: nextText } : item,
                    ),
                  );
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
                placeholder="Blank answer text"
              />
            </div>
          ))}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-orange-500 bg-transparent px-4 py-3 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/10"
            onClick={() => {
              const nextId = String.fromCharCode(65 + fibBlanks.length);
              setFibBlanks((current) => [...current, { id: nextId, text: "" }]);
            }}
          >
            Add another blank
          </button>
        </div>
      )}

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

      {uploadError ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Upload error: {uploadError}
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={mode === "edit" ? "Save changes" : "Create question"} />
    </form>
  );
}
