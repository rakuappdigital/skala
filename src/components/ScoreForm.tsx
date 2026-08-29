"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, Criterion } from "@/lib/types";

type CategoryWithCriteria = Category & { criteria: Criterion[] };

export function ScoreForm({
  personId,
  categories,
  latest,
}: {
  personId: string;
  categories: CategoryWithCriteria[];
  latest: Record<string, number>;
}) {
  const router = useRouter();
  const allCriteria = categories.flatMap((c) => c.criteria);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(allCriteria.map((c) => [c.id, String(latest[c.id] ?? "")]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(id: string, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entries = allCriteria
      .map((c) => ({ criterion_id: c.id, value: Number(values[c.id]) }))
      .filter((e) => Number.isFinite(e.value) && e.value >= 1 && e.value <= 10);

    if (entries.length === 0) {
      setError("En az bir kritere 1-10 arası puan gir.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: personId, entries }),
    });
    setSaving(false);

    if (!res.ok) {
      setError("Kaydedilemedi, tekrar dene.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      {categories.map((cat) => (
        <div key={cat.id} style={{ marginBottom: 20 }}>
          <div className="section-title">
            {cat.label} · ağırlık {(cat.weight * 100).toFixed(0)}%
          </div>
          {cat.criteria.map((crit) => (
            <div className="criterion-row" key={crit.id}>
              <label htmlFor={`crit-${crit.id}`}>{crit.label}</label>
              <input
                id={`crit-${crit.id}`}
                type="number"
                min={1}
                max={10}
                step={0.5}
                placeholder="—"
                value={values[crit.id]}
                onChange={(e) => setValue(crit.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
      {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Kaydediliyor…" : "Puanları kaydet"}
      </button>
    </form>
  );
}
