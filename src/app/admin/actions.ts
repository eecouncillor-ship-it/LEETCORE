"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createProblem, updateProblemBySlug } from "@/lib/db";
import { updateUserBlockedStatus } from "@/lib/db";
import { parseCommaList, parseLineList, slugify } from "@/lib/utils";
import type { Difficulty } from "@/lib/types";

export type QuestionFormState = {
  error?: string;
};

type ParsedQuestionForm = {
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  kind?: "mcq" | "fib";
  answer?: string;
  solutionExplanation: string;
  constraints: string[];
  tags: string[];
  published: boolean;
};

type ParseQuestionFormResult =
  | { ok: false; error: string }
  | { ok: true; data: ParsedQuestionForm };

function parseQuestionForm(formData: FormData): ParseQuestionFormResult {
  const title = String(formData.get("title") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "Easy") as Difficulty;
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const constraintsRaw = String(formData.get("constraints") ?? "");
  const tagsRaw = String(formData.get("tags") ?? "");
  const optionA = String(formData.get("optionA") ?? "").trim();
  const optionB = String(formData.get("optionB") ?? "").trim();
  const optionC = String(formData.get("optionC") ?? "").trim();
  const optionD = String(formData.get("optionD") ?? "").trim();
  const correctOptionId = String(formData.get("correctOptionId") ?? "").trim();
  const kind = String(formData.get("kind") ?? "mcq") as "mcq" | "fib";
  const fibAnswer = String(formData.get("fibAnswer") ?? "").trim();
  const solutionExplanation = String(formData.get("solutionExplanation") ?? "").trim();
  const published = String(formData.get("published") ?? "") === "on";

  if (!title || !category || !description || !solutionExplanation) {
    return { ok: false, error: "Please fill in all required question fields." };
  }

  if (kind === "mcq") {
    if (!optionA || !optionB || !optionC || !optionD || !correctOptionId) {
      return { ok: false, error: "Please provide all MCQ options and select the correct one." };
    }
  } else if (kind === "fib") {
    if (!fibAnswer) {
      return { ok: false, error: "Please provide the answer for fill-in-the-blank questions." };
    }
  }

  return {
    ok: true,
    data: {
      title,
      slug: slugify(title),
      difficulty,
      category,
      description,
      options: [
        { id: "A", text: optionA },
        { id: "B", text: optionB },
        { id: "C", text: optionC },
        { id: "D", text: optionD },
      ],
      correctOptionId,
      kind,
      answer: fibAnswer || undefined,
      solutionExplanation,
      constraints: parseLineList(constraintsRaw),
      tags: parseCommaList(tagsRaw),
      published,
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

  // handle optional image uploads (description and option images)
  const photos: Record<string, string> = {};

  async function fileToDataUri(f: File | null) {
    if (!f) return undefined;
    try {
      const buffer = Buffer.from(await f.arrayBuffer());
      return `data:${f.type};base64,${buffer.toString("base64")}`;
    } catch (e) {
      return undefined;
    }
  }

  const descFile = (formData.get("photoDescription") as File) ?? null;
  const optAFile = (formData.get("photoOptionA") as File) ?? null;
  const optBFile = (formData.get("photoOptionB") as File) ?? null;
  const optCFile = (formData.get("photoOptionC") as File) ?? null;
  const optDFile = (formData.get("photoOptionD") as File) ?? null;
  const fibPhotoFile = (formData.get("photoFib") as File) ?? null;

  const descData = await fileToDataUri(descFile);
  if (descData) photos.description = descData;
  const aData = await fileToDataUri(optAFile);
  if (aData) photos.optionA = aData;
  const bData = await fileToDataUri(optBFile);
  if (bData) photos.optionB = bData;
  const cData = await fileToDataUri(optCFile);
  if (cData) photos.optionC = cData;
  const dData = await fileToDataUri(optDFile);
  if (dData) photos.optionD = dData;
  const fibData = await fileToDataUri(fibPhotoFile);
  if (fibData) photos.fib = fibData;

  await createProblem({
    ...parsed.data,
    photos: Object.keys(photos).length ? photos : undefined,
    createdBy: user.id,
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

  const updated = await updateProblemBySlug(currentSlug, parsed.data);

  if (!updated) {
    return { error: "Question not found." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/problems");
  revalidatePath(`/admin/questions/${currentSlug}/edit`);
  revalidatePath(`/problems/${currentSlug}`);
  revalidatePath(`/problems/${updated.slug}`);
  redirect(`/admin/questions/${updated.slug}/edit?updated=1`);
}
