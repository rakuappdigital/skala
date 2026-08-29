import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, sha256Hex } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword || typeof password !== "string" || password !== appPassword) {
    return NextResponse.json({ error: "Şifre yanlış" }, { status: 401 });
  }

  const value = await sha256Hex(appPassword);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
