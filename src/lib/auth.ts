// Tek kullanıcılı, şifreyle korunan kişisel bir site için basit oturum:
// login route şifreyi APP_PASSWORD ile karşılaştırır, doğruysa şifrenin
// sha256 hash'ini httpOnly cookie'ye yazar. Middleware her istekte aynı
// hash'i env'den yeniden hesaplayıp cookie ile karşılaştırır.
export const SESSION_COOKIE = "skala_session";

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedSessionValue(): Promise<string> {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    throw new Error("APP_PASSWORD tanımlı değil (.env.local kontrol et)");
  }
  return sha256Hex(password);
}
