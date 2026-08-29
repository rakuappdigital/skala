import { cache } from "react";
import { readDB } from "@/lib/store";
import { categoryScoresForPerson, latestScoresForPerson, overallScoreFromCategories, rankingForTab } from "@/lib/scoring";
import type { Category, Criterion, Person, PersonScoreRow, PersonTab, ScoreEntry } from "@/lib/types";

// React cache() ile aynı istek içindeki tekrarlı çağrılar tek bir Blob
// okumasını paylaşır (bkz. [tab]/[id]/page.tsx'teki Promise.all).
export const getDB = cache(readDB);

export async function getRanking(tab: PersonTab): Promise<PersonScoreRow[]> {
  const db = await getDB();
  return rankingForTab(db, tab);
}

export async function getCategoriesWithCriteria(
  tab: PersonTab
): Promise<(Category & { criteria: Criterion[] })[]> {
  const db = await getDB();
  return db.categories
    .filter((c) => c.tab === tab)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((cat) => ({
      ...cat,
      criteria: db.criteria
        .filter((c) => c.category_id === cat.id && c.active)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
}

export async function getPerson(id: string): Promise<Person | null> {
  const db = await getDB();
  return db.people.find((p) => p.id === id) ?? null;
}

export async function getPersonScore(personId: string): Promise<PersonScoreRow | null> {
  const db = await getDB();
  const person = db.people.find((p) => p.id === personId);
  if (!person) return null;

  const categories = categoryScoresForPerson(db, personId);
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
}

export async function getCategoryScores(personId: string) {
  const db = await getDB();
  return categoryScoresForPerson(db, personId);
}

export async function getLatestScores(personId: string) {
  const db = await getDB();
  return latestScoresForPerson(db.scoreEntries, personId);
}

export async function getScoreHistory(
  personId: string
): Promise<(ScoreEntry & { criterion_label: string })[]> {
  const db = await getDB();
  const criterionLabel = new Map(db.criteria.map((c) => [c.id, c.label]));

  return db.scoreEntries
    .filter((e) => e.person_id === personId)
    .sort((a, b) => new Date(b.scored_at).getTime() - new Date(a.scored_at).getTime())
    .slice(0, 30)
    .map((e) => ({ ...e, criterion_label: criterionLabel.get(e.criterion_id) ?? "—" }));
}

export async function getPersonNotes(personId: string) {
  const db = await getDB();
  return db.personNotes
    .filter((n) => n.person_id === personId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
