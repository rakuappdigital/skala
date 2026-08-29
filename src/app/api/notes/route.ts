import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { person_id, body } = await req.json();

  if (typeof person_id !== "string" || typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("person_notes")
    .insert({ person_id, body: body.trim() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
