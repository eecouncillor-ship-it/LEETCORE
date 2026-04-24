"use server";

import { getPasswordReset, consumePasswordResetToken, updateUserPassword } from "@/lib/db";
import { signIn as signInWithSession } from "@/lib/auth";

export type ResetState = { error?: string };

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token || !password || !confirm) return { error: "Missing fields." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const reset = await getPasswordReset(token);
  if (!reset) return { error: "Invalid or expired token." };
  if (new Date(reset.expiresAt).getTime() < Date.now()) {
    await consumePasswordResetToken(token);
    return { error: "Token expired." };
  }

  const updated = await updateUserPassword(reset.userId, password);
  if (!updated) return { error: "Unable to update password." };

  // consume token and sign in the user
  await consumePasswordResetToken(token);
  await signInWithSession(updated.email, password);

  return {};
}
