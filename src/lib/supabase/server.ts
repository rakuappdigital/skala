import { createClient } from "@supabase/supabase-js";

// Sunucu tarafına özel: service-role anahtarı hiçbir zaman tarayıcıya
// gitmez. Tüm okuma/yazma Server Component'ler ve route handler'lar
// üzerinden buradan geçer, bkz. supabase/schema.sql'deki RLS notu.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanımlı değil (.env.local kontrol et)"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
