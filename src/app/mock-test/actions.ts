"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { getPublishedProblems, createMockSession, getProblemById, createSubmission, createMockResult } from "@/lib/db";
import type { QuestionOption } from "@/lib/types";
import { randomUUID } from "node:crypto";

export type MockFormState = { error?: string } | { session: any; problems: any[] };

export async function createMockAction(_prev: MockFormState, formData: FormData) {
  const user = await requireAuth();
  const category = String(formData.get("category") ?? "").trim();
  const count = Number(formData.get("count") ?? 5) || 5;
  const duration = Number(formData.get("duration") ?? 10) || 10;

  const problems = await getPublishedProblems();
  const pool = category ? problems.filter((p) => p.category === category) : problems;

  if (pool.length === 0) {
    return { error: "No problems available for the selected topic." };
  }

  // pick random unique problems up to count
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  const ids = selected.map((p) => p.id);

  const session = await createMockSession(user.id, ids, duration);
  // return session and selected problems so client can render the test inline
  const selectedMinimal = selected.map((p) => ({ id: p.id, title: p.title, description: p.description, options: p.options, correctOptionId: p.correctOptionId, solutionExplanation: p.solutionExplanation }));

  return { session, problems: selectedMinimal } as unknown as { session: any; problems: any[] };
}

export async function submitMockAction(_prev: MockFormState, formData: FormData) {
  const user = await requireAuth();
  const sessionId = String(formData.get("sessionId") ?? "").trim();

  if (!sessionId) return { error: "Missing session id." };

  // collect answers: form has fields like answer_<problemId>=optionId
  const answers: Record<string, string> = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (typeof key === "string" && key.startsWith("answer_")) {
      const pid = key.replace("answer_", "");
      answers[pid] = String(value);
    }
  }

  // create submissions for each answer and compute score
  let total = 0;
  let correct = 0;
  for (const [pid, picked] of Object.entries(answers)) {
    const prob = await getProblemById(pid);
    if (!prob) continue;
    total += 1;
    const option = prob.options.find((o: QuestionOption) => o.id === picked);
    const isCorrect = picked === prob.correctOptionId;
    if (isCorrect) correct += 1;

    const correctOpt = prob.options.find((o: QuestionOption) => o.id === prob.correctOptionId);

    await createSubmission({
      problemId: prob.id,
      userId: user.id,
      selectedOptionId: picked,
      selectedOptionText: option?.text ?? "",
      correctOptionId: prob.correctOptionId,
      correctOptionText: correctOpt?.text ?? "",
      solutionExplanation: prob.solutionExplanation,
      isCorrect,
      status: isCorrect ? "Correct" : "Incorrect",
    });
  }

  // record mock result
  await createMockResult(user.id, sessionId, total, correct);

  // revalidate mock test page and redirect to overview (so history shows immediately)
  revalidatePath("/mock-test");
  redirect("/mock-test");
}
