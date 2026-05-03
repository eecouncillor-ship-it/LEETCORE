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
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error: blobToken
          ? "BLOB_READ_WRITE_TOKEN is present, but this route requires the Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY with the Supabase service role key, not the blob token."
          : "Missing Supabase upload configuration. Set SUPABASE_SERVICE_ROLE_KEY to the Supabase service role key.",
      },
      { status: 500 }
    );
  }

  console.log("Uploading:", file.name, "using service role key");
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const fileName = `${Date.now()}-${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from("question-assets")
      .upload(fileName, file);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    const publicUrlData = supabase.storage
      .from("question-assets")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.data.publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed.", details: String(err) },
      { status: 500 }
    );
  }
}
