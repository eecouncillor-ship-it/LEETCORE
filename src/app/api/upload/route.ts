import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase upload configuration." },
      { status: 500 }
    );
  }

  console.log("Uploading:", file.name);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("question-assets")
    .upload(fileName, file);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const publicUrlData = supabase.storage
    .from("question-assets")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrlData.data.publicUrl });
}
