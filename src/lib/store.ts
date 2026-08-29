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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tüm veri (kişiler + kriterler + puan geçmişi) tek bir JSON dosyası
// olarak Vercel Blob'da tutuluyor. Kişisel/tek kullanıcılı bir site için
// ayrı bir veritabanı sunucusu kurmaya gerek bırakmıyor; ileride gerçek
// bir veritabanına geçmek istersen bu dosya tek değişim noktası.
export async function readDB(): Promise<DB> {
  try {
    const blob = await head(DB_PATHNAME);

    // Blob az önce yazıldıysa/silindiyse CDN kenarında bir süre negatif
    // önbelleklenebiliyor (404 cache'leniyor). Sorgu param'ı ekleyip
    // cache'i by-pass ediyoruz, ayrıca kısa bir retry uyguluyoruz.
    let lastStatus = 0;
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) await sleep(300 * attempt);
      const res = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
      if (res.ok) return (await res.json()) as DB;
      lastStatus = res.status;
    }
    throw new Error(`db okunamadı: ${lastStatus}`);
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
