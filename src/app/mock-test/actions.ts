"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { getAllProblems, createMockSession, getProblemById, createSubmission, createMockResult } from "@/lib/db";
import type { QuestionOption, SessionRecord, ProblemRecord } from "@/lib/types";
import { randomUUID } from "node:crypto";

export type MinimalProblem = Pick<ProblemRecord, 'id' | 'title' | 'description' | 'options' | 'correct_answer' | 'explanation' | 'topic'>;

export type MockFormState = { error?: string } | { session: SessionRecord; problems: MinimalProblem[] };

export async function createMockAction(_prev: MockFormState, formData: FormData) {
  const user = await requireAuth();
  const topic = String(formData.get("topic") ?? "").trim();
  const count = Number(formData.get("count") ?? 5) || 5;
  const duration = Number(formData.get("duration") ?? 10) || 10;

  console.log('[ACTION] Form duration input:', formData.get("duration"));
  console.log('[ACTION] Parsed duration:', duration);
  console.log('[ACTION] Duration type:', typeof duration);
  console.log('[ACTION] Is duration a valid number?', !isNaN(duration) && duration > 0);

  const problems = await getAllProblems();
  const pool = topic ? problems.filter((problem) => problem.topic === topic) : problems;

  if (pool.length === 0) {
    return { error: "No problems available for the selected topic." };
  }

  // pick random unique problems up to count
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  const ids = selected.map((p) => p.id);

  const session = await createMockSession(user.id, ids, duration);
  if (!session) {
    return { error: "Failed to create mock session. Please try again." };
  }
  // return session and selected problems so client can render the test inline
  const selectedMinimal: MinimalProblem[] = selected.map((p) => ({ id: p.id, title: p.title, description: p.description, options: p.options, correct_answer: p.correct_answer, explanation: p.explanation, topic: p.topic }));

  return { session, problems: selectedMinimal };
}

export async function submitMockAction(_prev: MockFormState, formData: FormData) {
  const user = await requireAuth();
  const sessionId = String(formData.get("sessionId") ?? "").trim();

  if (!sessionId) return { error: "Missing session id." };

  // collect answers: form fields are either answer_<problemId>=optionId or answer_<problemId>_<blankId>=text
  const answersByQuestion: Record<string, Record<string, string>> = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (typeof key !== "string" || !key.startsWith("answer_")) continue;

    const raw = key.slice(7);
    const lastUnderscore = raw.lastIndexOf("_");
    if (lastUnderscore === -1) {
      answersByQuestion[raw] = { selectedOptionId: String(value) };
    } else {
      const questionId = raw.slice(0, lastUnderscore);
      const blankId = raw.slice(lastUnderscore + 1);
      answersByQuestion[questionId] ??= {};
      answersByQuestion[questionId][blankId] = String(value);
    }
  }

  let total = 0;
  let correct = 0;
  for (const [pid, submitted] of Object.entries(answersByQuestion)) {
    const prob = await getProblemById(pid);
    if (!prob) continue;
    total += 1;

    let isCorrect = false;
    let selectedAnswer = "";

    if (prob.correct_answer === "FIB") {
      const blanks = prob.options.map((opt: QuestionOption) => {
        const answer = String(submitted[opt.id] ?? "").trim();
        const expected = String(opt.text ?? "").trim();
        return {
          blankId: opt.id,
          submitted: answer,
          expected,
          isCorrect: answer.toLowerCase() === expected.toLowerCase(),
        };
      });
      isCorrect = blanks.every((item: { isCorrect: boolean }) => item.isCorrect);
      selectedAnswer = JSON.stringify(blanks);
    } else {
      const picked = String(submitted.selectedOptionId ?? "");
      isCorrect = picked === prob.correct_answer;
      selectedAnswer = picked;
    }

    if (isCorrect) correct += 1;

    await createSubmission({
      user_email: user.email,
      question_id: prob.id,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
    });
  }

  // record mock result
  await createMockResult(user.id, sessionId, total, correct);

  // revalidate mock test page and redirect to overview (so history shows immediately)
  revalidatePath("/mock-test");
  redirect("/mock-test");
}
