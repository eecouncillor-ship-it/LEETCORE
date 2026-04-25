import { NextRequest } from "next/server";
import { scryptSync } from "node:crypto";
import { supabase } from "@/lib/supabase";

function hashPassword(password: string) {
  return scryptSync(password, "codearena-seed-salt", 64).toString("hex");
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

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("password_hash", hashPassword(password))
      .single();

    if (error || !data) {
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