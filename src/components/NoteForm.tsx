"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NoteForm({ personId }: { personId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: personId, body }),
    });
    setSaving(false);
    if (res.ok) {
      setBody("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <textarea
          placeholder="Neden bu puan? Kısa bir not bırak…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <button className="btn" disabled={saving || !body.trim()}>
        {saving ? "Ekleniyor…" : "Not ekle"}
      </button>
    </form>
  );
}
