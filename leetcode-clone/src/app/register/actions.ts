"use server";

import { redirect } from "next/navigation";

import { createUser } from "@/lib/db";
import { signIn as signInWithSession } from "@/lib/auth";
import { createRegistrationVerification } from "@/lib/db";
import { randomUUID } from "crypto";
import { scryptSync } from "crypto";

export type RegisterState = {
  error?: string;
};

export async function registerAction(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name || !email || !password || !confirm) {
    return { error: "Please fill all required fields." };
  }

  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  // restrict registration to institutional email addresses
  if (!email.toLowerCase().endsWith("@smail.iitm.ac.in")) {
    return { error: "Email must be an @smail.iitm.ac.in address." };
  }

  // create registration verification and send OTP (demo: show token)
  // check existing user
  const existing = await (await import("@/lib/db")).getUserByEmail(email);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const token = randomUUID();
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString(); // 15 minutes

  // hash password using same approach as seed (scrypt)
  const passwordHash = scryptSync(password, "codearena-seed-salt", 64).toString("hex");

  await createRegistrationVerification({ name, email, passwordHash, token, otp, expiresAt });

  // For demo purposes we return token+otp in state so it can be shown to the user. In a real app, send via email.
  return { error: undefined, token, otp } as unknown as RegisterState & { token?: string; otp?: string };
}
