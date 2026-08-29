import type { DB } from "@/lib/store";
import type {
  CategoryScoreRow,
  LatestScoreRow,
  PersonScoreRow,
  PersonTab,
  ScoreEntry,
} from "@/lib/types";

// Hesaplama motoru. Önceki Supabase tasarımındaki view zincirinin
// (latest_scores → category_scores → person_scores) doğrudan karşılığı,
// artık SQL yerine bellekte çalışıyor. Genel puan hiçbir yerde
// saklanmıyor, her zaman burada ham score_entries'ten türetiliyor.

export function latestScoresForPerson(entries: ScoreEntry[], personId: string): LatestScoreRow[] {
  const byCriterion = new Map<string, ScoreEntry>();
  for (const entry of entries) {
    if (entry.person_id !== personId) continue;
    const current = byCriterion.get(entry.criterion_id);
    if (!current || new Date(entry.scored_at) >= new Date(current.scored_at)) {
      byCriterion.set(entry.criterion_id, entry);
    }
  }
  return Array.from(byCriterion.values());
}

export function categoryScoresForPerson(db: DB, personId: string): CategoryScoreRow[] {
  const latest = latestScoresForPerson(db.scoreEntries, personId);
  const latestByCriterion = new Map(latest.map((s) => [s.criterion_id, s]));

  return db.categories
    .map((cat) => {
      const criteriaIds = db.criteria
        .filter((c) => c.category_id === cat.id && c.active)
        .map((c) => c.id);
      const values = criteriaIds
        .map((id) => latestByCriterion.get(id))
        .filter((s): s is LatestScoreRow => Boolean(s));

      if (values.length === 0) return null;

      const avg = values.reduce((sum, s) => sum + s.value, 0) / values.length;
      const lastScoredAt = values.reduce(
        (max, s) => (new Date(s.scored_at) > new Date(max) ? s.scored_at : max),
        values[0].scored_at
      );

      const row: CategoryScoreRow = {
        person_id: personId,
        category_id: cat.id,
        tab: cat.tab,
        category_key: cat.key,
        category_label: cat.label,
        category_weight: cat.weight,
        category_avg: Math.round(avg * 100) / 100,
        criteria_scored: values.length,
        category_last_scored_at: lastScoredAt,
      };
      return row;
    })
    .filter((row): row is CategoryScoreRow => row !== null);
}

// Sadece en az bir kritere puan girilmiş kategoriler dahil edilir,
// ağırlıklar bu alt küme üzerinde yeniden normalize edilir — eksik
// kategori kişiyi haksız yere aşağı çekmez.
export function overallScoreFromCategories(categories: CategoryScoreRow[]): number | null {
  if (categories.length === 0) return null;
  const weightSum = categories.reduce((s, c) => s + c.category_weight, 0);
  if (weightSum === 0) return null;
  const weighted = categories.reduce((s, c) => s + c.category_avg * c.category_weight, 0);
  return Math.round((weighted / weightSum) * 100) / 100;
}

export function rankingForTab(db: DB, tab: PersonTab): PersonScoreRow[] {
  const people = db.people.filter((p) => p.tab === tab);

  const rows: PersonScoreRow[] = people.map((person) => {
    const categories = categoryScoresForPerson(db, person.id);
    const lastScoredAt = categories.reduce<string | null>((max, c) => {
      if (!max) return c.category_last_scored_at;
      return new Date(c.category_last_scored_at) > new Date(max) ? c.category_last_scored_at : max;
    }, null);

    return {
      person_id: person.id,
      tab: person.tab,
      name: person.name,
      photo_url: person.photo_url,
      created_at: person.created_at,
      overall_score: overallScoreFromCategories(categories),
      categories_scored: categories.length,
      last_scored_at: lastScoredAt,
    };
  });

  return rows.sort((a, b) => {
    if (a.overall_score === null && b.overall_score === null) return a.name.localeCompare(b.name);
    if (a.overall_score === null) return 1;
    if (b.overall_score === null) return -1;
    return b.overall_score - a.overall_score || a.name.localeCompare(b.name);
  });
}
