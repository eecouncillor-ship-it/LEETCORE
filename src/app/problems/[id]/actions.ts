"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { createSubmission, getProblemBySlug } from "@/lib/db";
import type { QuestionOption } from "@/lib/types";

export type SubmissionState = {
  error?: string;
  result?: {
    isCorrect: boolean;
    selectedOptionId?: string;
    selectedOptionText?: string;
    correctOptionId?: string;
    correctOptionText?: string;
    solutionExplanation: string;
    answers?: Array<{
      blankId: string;
      submitted: string;
      expected: string;
      isCorrect: boolean;
    }>;
  };
};

export async function submitAnswerAction(
  id: string,
  _previousState: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const user = await requireAuth();
  const selectedOptionId = String(formData.get("selectedOptionId") ?? "").trim();

  const problem = await getProblemBySlug(id);

  if (!problem) {
    return { error: "Problem not found. Please go back and try again." };
  }

  const isFillInTheBlank = problem.correct_answer === "FIB";

  if (isFillInTheBlank) {
    const answers: Array<{
      blankId: string;
      submitted: string;
      expected: string;
      isCorrect: boolean;
    }> = problem.options.map((option: QuestionOption) => {
      const submitted = String(formData.get(`answer_${option.id}`) ?? "").trim();

      return {
        blankId: option.id,
        submitted,
        expected: option.text,
        isCorrect:
          option.text.trim().toLowerCase() === submitted.trim().toLowerCase(),
      };
    });

    if (answers.some((answer) => !answer.submitted)) {
      return { error: "Please fill in all blank answers before submitting." };
    }

    const isCorrect = answers.every((answer) => answer.isCorrect);

    await createSubmission({
      user_email: user.email,
      question_id: problem.id,
      selected_answer: JSON.stringify(answers.map((answer) => ({
        blankId: answer.blankId,
        submitted: answer.submitted,
      }))),
      is_correct: isCorrect,
    });

    revalidatePath("/problems");
    revalidatePath(`/problems/${id}`);

    return {
      result: {
        isCorrect,
        solutionExplanation: problem.explanation,
        answers,
      },
    };
  }

  if (!selectedOptionId) {
    return { error: "Select an option before submitting your answer." };
  }

  const selectedOption = problem.options.find(
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

  const isCorrect = selectedOption.id === correctOption.id;

  await createSubmission({
    user_email: user.email,
    question_id: problem.id,
    selected_answer: selectedOption.id,
    is_correct: isCorrect,
  });

  revalidatePath("/problems");
  revalidatePath(`/problems/${id}`);

  return {
    result: {
      isCorrect,
      selectedOptionId: selectedOption.id,
      selectedOptionText: selectedOption.text,
      correctOptionId: correctOption.id,
      correctOptionText: correctOption.text,
      solutionExplanation: problem.explanation,
    },
  };
}
