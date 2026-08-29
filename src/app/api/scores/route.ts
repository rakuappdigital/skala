import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/store";

interface ScoreInput {
  criterion_id: string;
  value: number;
  note?: string | null;
}

// Puanlar üstüne yazılmaz: her gönderim yeni score_entries kayıtları
// ekler (scored_at = şimdi). Genel puan hiçbir yerde saklanmıyor,
// bir sonraki okumada src/lib/scoring.ts en güncel değerlerden yeniden
// hesaplıyor.
export async function POST(req: NextRequest) {
  const { person_id, entries } = await req.json();

  if (typeof person_id !== "string" || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const rows = (entries as ScoreInput[])
    .filter(
      (e) =>
        e &&
        typeof e.criterion_id === "string" &&
        typeof e.value === "number" &&
        e.value >= 1 &&
        e.value <= 10
    )
    .map((e) => ({
      id: crypto.randomUUID(),
      person_id,
      criterion_id: e.criterion_id,
      value: e.value,
      note: e.note?.trim() || null,
      scored_at: now,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ error: "Girilecek puan yok" }, { status: 400 });
  }

  const db = await readDB();
  if (!db.people.some((p) => p.id === person_id)) {
    return NextResponse.json({ error: "Kişi bulunamadı" }, { status: 404 });
  }
  db.scoreEntries.push(...rows);
  await writeDB(db);

  return NextResponse.json({ ok: true });
}
