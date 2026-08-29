import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

interface ScoreInput {
  criterion_id: string;
  value: number;
  note?: string | null;
}

// Puanlar üstüne yazılmaz: her gönderim yeni score_entries satırları
// ekler (scored_at = şimdi). person_scores view'i bir sonraki okumada
// otomatik olarak en güncel değerleri kullanır — burada ayrıca bir
// "toplam puanı güncelle" adımı yok.
export async function POST(req: NextRequest) {
  const { person_id, entries } = await req.json();

  if (typeof person_id !== "string" || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const rows = (entries as ScoreInput[])
    .filter((e) => e && typeof e.criterion_id === "string" && typeof e.value === "number")
    .map((e) => ({
      person_id,
      criterion_id: e.criterion_id,
      value: e.value,
      note: e.note?.trim() || null,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ error: "Girilecek puan yok" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("score_entries").insert(rows);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
