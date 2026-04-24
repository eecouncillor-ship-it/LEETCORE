"use server";

import { redirect } from "next/navigation";

import { createUser } from "@/lib/db";
import { signIn as signInWithSession } from "@/lib/auth";

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

  // Attempt to create user directly
  const created = await createUser({ name, email, password });
  if (!created) {
    return { error: "An account with this email already exists." };
  }

  // Sign in the newly created user and redirect to problems
  await signInWithSession(email, password);
  redirect("/problems");
}
