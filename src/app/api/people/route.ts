import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isPersonTab } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { tab, name, photo_url } = await req.json();

  if (typeof tab !== "string" || !isPersonTab(tab)) {
    return NextResponse.json({ error: "Geçersiz sekme" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "İsim gerekli" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("people")
    .insert({ tab, name: name.trim(), photo_url: photo_url ?? null })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
