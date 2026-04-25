"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { createSubmission, getProblemBySlug } from "@/lib/db";
import type { QuestionOption } from "@/lib/types";

export type SubmissionState = {
  error?: string;
  result?: {
    isCorrect: boolean;
    selectedOptionId: string;
    selectedOptionText: string;
    correctOptionId: string;
    correctOptionText: string;
    solutionExplanation: string;
  };
};

export async function submitAnswerAction(
  slug: string,
  _previousState: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const user = await requireAuth();
  const selectedOptionId = String(formData.get("selectedOptionId") ?? "").trim();

  if (!selectedOptionId) {
    return { error: "Select an option before submitting your answer." };
  }

  const problem = await getProblemBySlug(slug);

  if (!problem || !problem.published) {
    redirect("/problems");
  }

  const selectedOption = problem.options.find(
    (option: QuestionOption) => option.id === selectedOptionId,
  );

  if (!selectedOption) {
    return { error: "That option is not valid for this question." };
  }

  const correctOption = problem.options.find(
    (option: QuestionOption) => option.id === problem.correctOptionId,
  );

  if (!correctOption) {
    return { error: "This question is missing a valid answer key." };
  }

  const isCorrect = selectedOption.id === correctOption.id;

  await createSubmission({
    problemId: problem.id,
    userId: user.id,
    selectedOptionId: selectedOption.id,
    selectedOptionText: selectedOption.text,
    correctOptionId: correctOption.id,
    correctOptionText: correctOption.text,
    solutionExplanation: problem.solutionExplanation,
    isCorrect,
    status: isCorrect ? "Correct" : "Incorrect",
  });

  revalidatePath("/problems");
  revalidatePath(`/problems/${slug}`);

  return {
    result: {
      isCorrect,
      selectedOptionId: selectedOption.id,
      selectedOptionText: selectedOption.text,
      correctOptionId: correctOption.id,
      correctOptionText: correctOption.text,
      solutionExplanation: problem.solutionExplanation,
    },
  };
}
