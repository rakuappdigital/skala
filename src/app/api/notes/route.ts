import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { person_id, body } = await req.json();

  if (typeof person_id !== "string" || typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const db = await readDB();
  if (!db.people.some((p) => p.id === person_id)) {
    return NextResponse.json({ error: "Kişi bulunamadı" }, { status: 404 });
  }

  db.personNotes.push({
    id: crypto.randomUUID(),
    person_id,
    body: body.trim(),
    created_at: new Date().toISOString(),
  });
  await writeDB(db);

  return NextResponse.json({ ok: true });
}
