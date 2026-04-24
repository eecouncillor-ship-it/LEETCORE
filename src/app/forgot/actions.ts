"use server";

import { createPasswordResetTokenByEmail } from "@/lib/db";

export type ForgotState = { error?: string; token?: string };

export async function forgotAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  const reset = await createPasswordResetTokenByEmail(email);
  if (!reset) return { error: "No account found with that email." };

  // In a real app we'd email the token. For this demo, return the token so UI can show link.
  return { token: reset.token };
}
