import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  Category,
  CategoryScoreRow,
  Criterion,
  LatestScoreRow,
  Person,
  PersonNote,
  PersonScoreRow,
  PersonTab,
  ScoreEntry,
} from "@/lib/types";

export async function getRanking(tab: PersonTab): Promise<PersonScoreRow[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("person_scores")
    .select("*")
    .eq("tab", tab)
    .order("overall_score", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data as PersonScoreRow[];
}

export async function getCategoriesWithCriteria(
  tab: PersonTab
): Promise<(Category & { criteria: Criterion[] })[]> {
  const supabase = supabaseAdmin();
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("tab", tab)
    .order("sort_order", { ascending: true });

  if (catError) throw new Error(catError.message);

  const { data: criteria, error: critError } = await supabase
    .from("criteria")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (critError) throw new Error(critError.message);

  return (categories as Category[]).map((cat) => ({
    ...cat,
    criteria: (criteria as Criterion[]).filter((c) => c.category_id === cat.id),
  }));
}

export async function getPerson(id: string): Promise<Person | null> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Person | null;
}

export async function getPersonScore(personId: string): Promise<PersonScoreRow | null> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("person_scores")
    .select("*")
    .eq("person_id", personId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as PersonScoreRow | null;
}

export async function getCategoryScores(personId: string): Promise<CategoryScoreRow[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("category_scores")
    .select("*")
    .eq("person_id", personId);

  if (error) throw new Error(error.message);
  return data as CategoryScoreRow[];
}

export async function getLatestScores(personId: string): Promise<LatestScoreRow[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("latest_scores")
    .select("*")
    .eq("person_id", personId);

  if (error) throw new Error(error.message);
  return data as LatestScoreRow[];
}

export async function getScoreHistory(personId: string): Promise<
  (ScoreEntry & { criterion_label: string })[]
> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("score_entries")
    .select("*, criteria(label)")
    .eq("person_id", personId)
    .order("scored_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return (data as unknown as (ScoreEntry & { criteria: { label: string } })[]).map((row) => ({
    ...row,
    criterion_label: row.criteria?.label ?? "—",
  }));
}

export async function getPersonNotes(personId: string): Promise<PersonNote[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("person_notes")
    .select("*")
    .eq("person_id", personId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as PersonNote[];
}
