import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonAvatar } from "@/components/PersonAvatar";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { ScoreForm } from "@/components/ScoreForm";
import { NoteForm } from "@/components/NoteForm";
import { formatRelative } from "@/lib/format";
import {
  getCategoriesWithCriteria,
  getCategoryScores,
  getLatestScores,
  getPerson,
  getPersonNotes,
  getPersonScore,
  getScoreHistory,
} from "@/lib/data";
import { isPersonTab, TAB_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ tab: string; id: string }>;
}) {
  const { tab, id } = await params;
  if (!isPersonTab(tab)) notFound();

  const person = await getPerson(id);
  if (!person || person.tab !== tab) notFound();

  const [categories, personScore, categoryScores, latestScores, history, notes] =
    await Promise.all([
      getCategoriesWithCriteria(tab),
      getPersonScore(id),
      getCategoryScores(id),
      getLatestScores(id),
      getScoreHistory(id),
      getPersonNotes(id),
    ]);

  const latestMap = Object.fromEntries(latestScores.map((s) => [s.criterion_id, s.value]));

  return (
    <div className="shell">
      <Link href={`/${tab}`} className="back-link">
        ← {TAB_LABELS[tab]}
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <PersonAvatar name={person.name} photoUrl={person.photo_url} size="lg" />
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>{person.name}</h1>
          <div className="rank-meta" style={{ fontSize: 13 }}>
            {formatRelative(personScore?.last_scored_at ?? null)}
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 34, color: "var(--accent-strong)" }}>
            {personScore?.overall_score?.toFixed(1) ?? "—"}
          </div>
          <div className="rank-meta">genel puan</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Kırılım</div>
        <CategoryBreakdown categories={categoryScores} />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Puanla</div>
        <ScoreForm personId={person.id} categories={categories} latest={latestMap} />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Notlar</div>
        <NoteForm personId={person.id} />
        {notes.length > 0 && (
          <div style={{ marginTop: 18 }}>
            {notes.map((note) => (
              <div className="history-item" key={note.id}>
                <span>{note.body}</span>
                <span className="when">{formatRelative(note.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="card">
          <div className="section-title">Geçmiş</div>
          {history.map((entry) => (
            <div className="history-item" key={entry.id}>
              <span>
                <span className="criterion">{entry.criterion_label}</span> · {entry.value.toFixed(1)}
              </span>
              <span className="when">{formatRelative(entry.scored_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
