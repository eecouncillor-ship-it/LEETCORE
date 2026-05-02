"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createProblem, updateProblemById } from "@/lib/db";
import { updateUserBlockedStatus } from "@/lib/db";
import { parseCommaList, parseLineList, slugify } from "@/lib/utils";
import type { Difficulty } from "@/lib/types";

export type QuestionFormState = {
  error?: string;
};

type ParsedQuestionForm = {
  title: string;
  topic: string;
  difficulty: Difficulty;
  description: string;
  questionImageUrl?: string;
  options: Array<{ id: string; text: string; image_url?: string }>;
  optionImageUrls: Record<"A" | "B" | "C" | "D", string | undefined>;
  correctOptionId: string;
  solutionExplanation: string;
};

type ParseQuestionFormResult =
  | { ok: false; error: string }
  | { ok: true; data: ParsedQuestionForm };

function parseQuestionForm(formData: FormData): ParseQuestionFormResult {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const optionA = String(formData.get("optionA") ?? "").trim();
  const optionB = String(formData.get("optionB") ?? "").trim();
  const optionC = String(formData.get("optionC") ?? "").trim();
  const optionD = String(formData.get("optionD") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "").trim() as Difficulty;
  const correctOptionId = String(formData.get("correctOptionId") ?? "").trim();
  const solutionExplanation = String(formData.get("solutionExplanation") ?? "").trim();
  const questionImageUrl = String(formData.get("questionImageUrl") ?? "").trim() || undefined;
  const optionImageUrls = {
    A: String(formData.get("optionAImageUrl") ?? "").trim() || undefined,
    B: String(formData.get("optionBImageUrl") ?? "").trim() || undefined,
    C: String(formData.get("optionCImageUrl") ?? "").trim() || undefined,
    D: String(formData.get("optionDImageUrl") ?? "").trim() || undefined,
  };

  if (!title || !description || !topic || !difficulty || !solutionExplanation) {
    return { ok: false, error: "Please fill in all required question fields." };
  }

  if (!optionA || !optionB || !optionC || !optionD || !correctOptionId) {
    return { ok: false, error: "Please provide all MCQ options and select the correct one." };
  }

  return {
    ok: true,
    data: {
      title,
      topic,
      difficulty,
      description,
      questionImageUrl,
      options: [
        { id: "A", text: optionA, image_url: optionImageUrls.A },
        { id: "B", text: optionB, image_url: optionImageUrls.B },
        { id: "C", text: optionC, image_url: optionImageUrls.C },
        { id: "D", text: optionD, image_url: optionImageUrls.D },
      ],
      optionImageUrls,
      correctOptionId,
      solutionExplanation,
    },
  };
}

export async function toggleUserBlockAction(
  formData: FormData,
) {
  await requireAuth("admin");
  const userId = String(formData.get("userId") ?? "").trim();
  const block = String(formData.get("block") ?? "0") === "1";

  if (!userId) {
    return;
  }

  await updateUserBlockedStatus(userId, block);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function createProblemAction(
  _previousState: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const user = await requireAuth("admin");
  const parsed = parseQuestionForm(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await createProblem({
    title: parsed.data.title,
    topic: parsed.data.topic,
    difficulty: parsed.data.difficulty,
    description: parsed.data.description,
    image_url: parsed.data.questionImageUrl,
    options: parsed.data.options,
    correct_answer: parsed.data.correctOptionId,
    explanation: parsed.data.solutionExplanation,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/problems");
  redirect("/admin?created=1");
}

export async function updateProblemAction(
  currentSlug: string,
  _previousState: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireAuth("admin");
  const parsed = parseQuestionForm(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const updated = await updateProblemById(currentSlug, {
    title: parsed.data.title,
    topic: parsed.data.topic,
    difficulty: parsed.data.difficulty,
    description: parsed.data.description,
    image_url: parsed.data.questionImageUrl,
    options: parsed.data.options,
    correct_answer: parsed.data.correctOptionId,
    explanation: parsed.data.solutionExplanation,
  });

  if (!updated) {
    return { error: "Question not found." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/problems");
  revalidatePath(`/admin/questions/${currentSlug}/edit`);
  revalidatePath(`/problems/${currentSlug}`);
  redirect(`/admin/questions/${updated.id}/edit?updated=1`);
}
