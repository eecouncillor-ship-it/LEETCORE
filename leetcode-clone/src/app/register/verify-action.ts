"use server";

import { getRegistrationVerificationByToken, consumeRegistrationVerification, createUser } from "@/lib/db";
import { redirect } from "next/navigation";

export type VerifyState = { error?: string };

export async function verifyRegistrationAction(_prev: VerifyState, formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!token || !otp) return { error: "Missing token or otp." };

  const rec = await getRegistrationVerificationByToken(token);
  if (!rec) return { error: "Invalid or expired token." };

  if (rec.otp !== otp) return { error: "OTP does not match." };

  // create user using stored passwordHash
  const created = await createUser({ name: rec.name, email: rec.email, passwordHash: rec.passwordHash }).catch(() => null);

  if (!created) {
    return { error: "Failed to create user." };
  }

  // consume verification record
  await consumeRegistrationVerification(token);

  // Redirect to login page (user can login)
  redirect(`/login?registered=1`);
}
