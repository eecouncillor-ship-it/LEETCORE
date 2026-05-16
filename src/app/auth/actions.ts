"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import {
  createSession,
  createUser,
  getUserByEmail,
  oauthPlaceholderPasswordHash,
} from "@/lib/db";
import { ensureSupabaseEnv } from "@/lib/supabase";
import type { Role } from "@/lib/types";

const sessionCookieName = "codearena_session";

export type BridgeOAuthResult =
  | { ok: true; role: Role }
  | { ok: false; error: string };

export async function bridgeOAuthSession(
  accessToken: string,
): Promise<BridgeOAuthResult> {
  const token = accessToken?.trim();
  if (!token) {
    return { ok: false, error: "missing_token" };
  }

  ensureSupabaseEnv();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user?.email) {
    return { ok: false, error: "invalid_session" };
  }

  const email = user.email.trim().toLowerCase();

  let appUser = await getUserByEmail(email);

  if (!appUser) {
    const created = await createUser({
      email,
      passwordHash: oauthPlaceholderPasswordHash(),
      role: "user",
    });
    appUser = created ?? (await getUserByEmail(email));
  }

  if (!appUser) {
    return { ok: false, error: "user_setup_failed" };
  }

  if (appUser.isBlocked) {
    return { ok: false, error: "blocked" };
  }

  const session = await createSession(appUser.id);
  if (!session) {
    return { ok: false, error: "session_failed" };
  }

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return { ok: true, role: appUser.role };
}
