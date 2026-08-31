import { del, list, put } from "@vercel/blob";
import { seedCategories, seedCriteria } from "@/lib/seed";
import type { Category, Criterion, Person, PersonNote, ScoreEntry } from "@/lib/types";

export interface DB {
  categories: Category[];
  criteria: Criterion[];
  people: Person[];
  scoreEntries: ScoreEntry[];
  personNotes: PersonNote[];
}

// Overwriting the same blob pathname repeatedly turned out to be
// unreliable: Vercel Blob's CDN can keep serving the previous version
// of a URL for a while after an overwrite, so a page loaded right
// after a write could read stale data (a just-created person would
// briefly 404). Each write is now a new, never-before-seen blob under
// this prefix — immutable URLs can't go stale — and reads pick the
// newest one via list(). Old versions are pruned after each write.
const DB_PREFIX = "skala/db/";
const KEEP_VERSIONS = 2;

function emptyDB(): DB {
  return {
    categories: seedCategories(),
    criteria: seedCriteria(),
    people: [],
    scoreEntries: [],
    personNotes: [],
  };
}

export async function readDB(): Promise<DB> {
  const { blobs } = await list({ prefix: DB_PREFIX });

  if (blobs.length === 0) {
    const db = emptyDB();
    await writeDB(db);
    return db;
  }

  const latest = blobs.reduce((a, b) => (a.uploadedAt > b.uploadedAt ? a : b));
  const res = await fetch(latest.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`db okunamadı: ${res.status}`);
  return (await res.json()) as DB;
}

export async function writeDB(db: DB): Promise<void> {
  const pathname = `${DB_PREFIX}${Date.now()}-${crypto.randomUUID()}.json`;
  await put(pathname, JSON.stringify(db), {
    access: "public",
    contentType: "application/json",
  });

  const { blobs } = await list({ prefix: DB_PREFIX });
  const stale = blobs
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(KEEP_VERSIONS);
  if (stale.length > 0) {
    await del(stale.map((b) => b.url));
  }
}
