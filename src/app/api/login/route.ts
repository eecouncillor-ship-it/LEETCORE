import { NextRequest } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { supabase } from "@/lib/supabase";

function hashPassword(password: string) {
  return scryptSync(password, "codearena-seed-salt", 64).toString("hex");
}

function verifyPassword(password: string, passwordHash: string) {
  const source = Buffer.from(hashPassword(password), "hex");
  const target = Buffer.from(passwordHash, "hex");

  if (source.length !== target.length) {
    return false;
  }

  return timingSafeEqual(source, target);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Step 1: Query user by email only
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Step 2: Verify password locally with timing-safe comparison
    if (!verifyPassword(password, data.password)) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      user: data
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}