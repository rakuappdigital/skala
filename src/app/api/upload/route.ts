import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// İstemci fotoğrafı kare bir canvas'ta sabit çözünürlüğe indirip
// buraya gönderir (bkz. PhotoUploader.tsx) — burada tekrar boyutlandırma
// yapılmıyor, sadece depolanıyor.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const fileName = `${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, await file.arrayBuffer(), {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
