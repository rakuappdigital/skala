"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PhotoUploader } from "@/components/PhotoUploader";
import { TAB_LABELS, isPersonTab } from "@/lib/types";

export default function NewPersonPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPersonTab(tab)) {
    return <div className="shell">Geçersiz sekme.</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("İsim gerekli.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab, name, photo_url: photoUrl }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Kaydedilemedi, tekrar dene.");
      return;
    }
    const data = await res.json();
    router.push(`/${tab}/${data.id}`);
  }

  return (
    <div className="shell">
      <Link href={`/${tab}`} className="back-link">
        ← {TAB_LABELS[tab]}
      </Link>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Yeni kişi</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">İsim</label>
          <input
            id="name"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Fotoğraf</label>
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
        </div>
        {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kişiyi ekle"}
        </button>
      </form>
    </div>
  );
}
