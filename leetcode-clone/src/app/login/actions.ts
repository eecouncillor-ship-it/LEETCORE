"use server";

import { redirect } from "next/navigation";

import { signIn as signInWithSession, signOut as clearSession } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const user = await signInWithSession(email, password);

  if (!user) {
    return { error: "Invalid credentials. Try one of the demo accounts below." };
  }

  redirect(user.role === "admin" ? "/admin" : "/problems");
}

export async function signOut() {
  await clearSession();
  redirect("/");
}
