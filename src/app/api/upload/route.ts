import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// İstemci fotoğrafı kare bir canvas'ta sabit çözünürlüğe indirip
// buraya gönderir (bkz. PhotoUploader.tsx) — burada tekrar boyutlandırma
// yapılmıyor, sadece depolanıyor.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  const blob = await put(`skala/avatars/${crypto.randomUUID()}.jpg`, file, {
    access: "public",
    contentType: "image/jpeg",
  });

  return NextResponse.json({ url: blob.url });
}
