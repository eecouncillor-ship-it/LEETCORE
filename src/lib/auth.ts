import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { scryptSync, timingSafeEqual } from "node:crypto";

import { supabase } from "@/lib/supabase";
import { createSession, deleteSession, getSession, getUserByEmail, getUserById } from "@/lib/db";
import type { Role } from "@/lib/types";

const sessionCookieName = "codearena_session";
const sessionSalt = "codearena-seed-salt";

function hashPassword(password: string) {
  return scryptSync(password, sessionSalt, 64).toString("hex");
}

export function verifyPassword(password: string, passwordHash: string) {
  const source = Buffer.from(hashPassword(password), "hex");
  const target = Buffer.from(passwordHash, "hex");

  if (source.length !== target.length) {
    return false;
  }

  return timingSafeEqual(source, target);
}

export async function signIn(email: string, password: string) {
  "use server";

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  // Verify the password against the stored hash
  if (!verifyPassword(password, data.password)) {
    return null;
  }

  const session = await createSession(data.id);
  if (!session) {
    return null;
  }

  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return {
    id: data.id,
    email: data.email,
    role: data.role,
  };
}

export async function signOut() {
  "use server";
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(sessionCookieName)?.value;

    if (token) {
      await deleteSession(token);
      cookieStore.delete(sessionCookieName);
    }
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(sessionCookieName)?.value;

    if (!token) {
      return null;
    }

    const session = await getSession(token);

    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await deleteSession(session.token);
      return null;
    }

    return getUserById(session.userId);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireAuth(role?: Role) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (role && user.role !== role) {
    redirect(user.role === "admin" ? "/admin" : "/problems");
  }

  return user;
}
