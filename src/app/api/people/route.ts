import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/store";
import { isPersonTab } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { tab, name, photo_url } = await req.json();

  if (typeof tab !== "string" || !isPersonTab(tab)) {
    return NextResponse.json({ error: "Geçersiz sekme" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "İsim gerekli" }, { status: 400 });
  }

  const db = await readDB();
  const person = {
    id: crypto.randomUUID(),
    tab,
    name: name.trim(),
    photo_url: photo_url ?? null,
    created_at: new Date().toISOString(),
  };
  db.people.push(person);
  await writeDB(db);

  return NextResponse.json({ id: person.id });
}
