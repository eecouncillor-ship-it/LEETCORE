import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { scryptSync, timingSafeEqual } from "node:crypto";

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
  const user = await getUserByEmail(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  if ((user as any).isBlocked) {
    return null;
  }

  const session = await createSession(user.id);
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return user;
}

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await deleteSession(token);
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await getSession(token);

  if (!session) {
    cookieStore.delete(sessionCookieName);
    return null;
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await deleteSession(session.token);
    cookieStore.delete(sessionCookieName);
    return null;
  }

  return getUserById(session.userId);
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
