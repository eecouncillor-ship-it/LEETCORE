"use server";

import { revalidatePath } from "next/cache";

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
  id: string,
  _previousState: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const user = await requireAuth();
  const answerText = String(formData.get("answerText") ?? "").trim();
  const selectedOptionId = String(formData.get("selectedOptionId") ?? "").trim();

  const problem = await getProblemBySlug(id);

  if (!problem) {
    return { error: "Problem not found. Please go back and try again." };
  }

  const isFillInTheBlank = problem.options.length === 1;

  let selectedOption: QuestionOption | undefined;
  let selectedOptionText = "";
  let isCorrect = false;

  if (isFillInTheBlank) {
    if (!answerText) {
      return { error: "Please enter your answer before submitting." };
    }

    const correctOption = problem.options[0];
    selectedOption = correctOption;
    selectedOptionText = answerText;
    isCorrect =
      correctOption.text.trim().toLowerCase() === answerText.trim().toLowerCase();
  } else {
    if (!selectedOptionId) {
      return { error: "Select an option before submitting your answer." };
    }

    selectedOption = problem.options.find(
      (option: QuestionOption) => option.id === selectedOptionId,
    );

    if (!selectedOption) {
      return { error: "That option is not valid for this question." };
    }

    const correctOption = problem.options.find(
      (option: QuestionOption) => option.id === problem.correct_answer,
    );

    if (!correctOption) {
      return { error: "This question is missing a valid answer key." };
    }

    isCorrect = selectedOption.id === correctOption.id;
    selectedOptionText = selectedOption.text;
  }

  if (!selectedOption) {
    return { error: "Unable to process your answer." };
  }

  await createSubmission({
    user_email: user.email,
    question_id: problem.id,
    selected_answer: isFillInTheBlank ? selectedOptionText : selectedOption.id,
    is_correct: isCorrect,
  });

  revalidatePath("/problems");
  revalidatePath(`/problems/${id}`);

  return {
    result: {
      isCorrect,
      selectedOptionId: selectedOption.id,
      selectedOptionText,
      correctOptionId: selectedOption.id,
      correctOptionText: selectedOption.text,
      solutionExplanation: problem.explanation,
    },
  };
}
