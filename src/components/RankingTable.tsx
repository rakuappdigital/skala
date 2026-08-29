import Link from "next/link";
import { PersonAvatar } from "./PersonAvatar";
import { formatRelative } from "@/lib/format";
import type { PersonScoreRow, PersonTab } from "@/lib/types";

export function RankingTable({ rows, tab }: { rows: PersonScoreRow[]; tab: PersonTab }) {
  if (rows.length === 0) {
    return (
      <div className="rank-list">
        <div className="empty-state">Henüz kimse eklenmedi.</div>
      </div>
    );
  }

  return (
    <div className="rank-list">
      {rows.map((row, i) => (
        <Link key={row.person_id} href={`/${tab}/${row.person_id}`} className="rank-row">
          <span className="rank-num mono">{String(i + 1).padStart(2, "0")}</span>
          <PersonAvatar name={row.name} photoUrl={row.photo_url} size="sm" />
          <span>
            <span className="rank-name">{row.name}</span>
            <span className="rank-meta">{formatRelative(row.last_scored_at)}</span>
          </span>
          {row.overall_score !== null ? (
            <span className="rank-score">{row.overall_score.toFixed(1)}</span>
          ) : (
            <span className="rank-score pending">puanlanmadı</span>
          )}
        </Link>
      ))}
    </div>
  );
}
