export type PersonTab = "arkadaslar" | "sevgililer";
export type CategoryKey = "karakter" | "fiziksel";

export interface Category {
  id: string;
  tab: PersonTab;
  key: CategoryKey;
  label: string;
  weight: number;
  sort_order: number;
}

export interface Criterion {
  id: string;
  category_id: string;
  label: string;
  sort_order: number;
  active: boolean;
}

export interface Person {
  id: string;
  tab: PersonTab;
  name: string;
  photo_url: string | null;
  created_at: string;
}

export interface ScoreEntry {
  id: string;
  person_id: string;
  criterion_id: string;
  value: number;
  note: string | null;
  scored_at: string;
}

export interface PersonNote {
  id: string;
  person_id: string;
  body: string;
  created_at: string;
}

// person_scores view çıktısı — genel puan her zaman burada, DB'de
// türetiliyor.
export interface PersonScoreRow {
  person_id: string;
  tab: PersonTab;
  name: string;
  photo_url: string | null;
  created_at: string;
  overall_score: number | null;
  categories_scored: number;
  last_scored_at: string | null;
}

// category_scores view çıktısı
export interface CategoryScoreRow {
  person_id: string;
  category_id: string;
  tab: PersonTab;
  category_key: CategoryKey;
  category_label: string;
  category_weight: number;
  category_avg: number;
  criteria_scored: number;
  category_last_scored_at: string;
}

// latest_scores view çıktısı
export interface LatestScoreRow {
  person_id: string;
  criterion_id: string;
  value: number;
  note: string | null;
  scored_at: string;
}

export const TAB_LABELS: Record<PersonTab, string> = {
  arkadaslar: "Arkadaşlar",
  sevgililer: "Sevgililer",
};

export function isPersonTab(value: string): value is PersonTab {
  return value === "arkadaslar" || value === "sevgililer";
}
