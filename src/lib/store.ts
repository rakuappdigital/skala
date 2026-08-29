import { BlobNotFoundError, head, put } from "@vercel/blob";
import { seedCategories, seedCriteria } from "@/lib/seed";
import type { Category, Criterion, Person, PersonNote, ScoreEntry } from "@/lib/types";

export interface DB {
  categories: Category[];
  criteria: Criterion[];
  people: Person[];
  scoreEntries: ScoreEntry[];
  personNotes: PersonNote[];
}

const DB_PATHNAME = "skala/db.json";

function emptyDB(): DB {
  return {
    categories: seedCategories(),
    criteria: seedCriteria(),
    people: [],
    scoreEntries: [],
    personNotes: [],
  };
}

// Tüm veri (kişiler + kriterler + puan geçmişi) tek bir JSON dosyası
// olarak Vercel Blob'da tutuluyor. Kişisel/tek kullanıcılı bir site için
// ayrı bir veritabanı sunucusu kurmaya gerek bırakmıyor; ileride gerçek
// bir veritabanına geçmek istersen bu dosya tek değişim noktası.
export async function readDB(): Promise<DB> {
  try {
    const blob = await head(DB_PATHNAME);
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`db okunamadı: ${res.status}`);
    return (await res.json()) as DB;
  } catch (err) {
    if (err instanceof BlobNotFoundError) {
      const db = emptyDB();
      await writeDB(db);
      return db;
    }
    throw err;
  }
}

export async function writeDB(db: DB): Promise<void> {
  await put(DB_PATHNAME, JSON.stringify(db), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}
