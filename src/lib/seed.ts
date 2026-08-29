import type { Category, Criterion } from "@/lib/types";

// Başlangıç kriter seti. Kategori/kriter kimlikleri sabit slug'lar —
// veri Blob'da ilk kez oluşturulurken buradan tohumlanıyor. Sonradan
// eklenen/silinen kriterler artık burada değil, Blob'daki DB üzerinde
// yönetiliyor (bkz. src/lib/store.ts).
export function seedCategories(): Category[] {
  return [
    { id: "arkadaslar:karakter", tab: "arkadaslar", key: "karakter", label: "Karakter", weight: 0.7, sort_order: 1 },
    { id: "arkadaslar:fiziksel", tab: "arkadaslar", key: "fiziksel", label: "Fiziksel", weight: 0.3, sort_order: 2 },
    { id: "sevgililer:karakter", tab: "sevgililer", key: "karakter", label: "Karakter", weight: 0.55, sort_order: 1 },
    { id: "sevgililer:fiziksel", tab: "sevgililer", key: "fiziksel", label: "Fiziksel", weight: 0.45, sort_order: 2 },
  ];
}

export function seedCriteria(): Criterion[] {
  const rows: [string, string, number][] = [
    ["arkadaslar:karakter", "Güvenilirlik", 1],
    ["arkadaslar:karakter", "Ulaşılabilirlik", 2],
    ["arkadaslar:karakter", "Mizah", 3],
    ["arkadaslar:karakter", "Zor günde yanında olma", 4],
    ["arkadaslar:karakter", "Sohbet kalitesi", 5],
    ["arkadaslar:fiziksel", "Genel görünüm", 1],
    ["arkadaslar:fiziksel", "Bakım / stil", 2],
    ["arkadaslar:fiziksel", "Enerji", 3],
    ["sevgililer:karakter", "Zeka / sohbet kalitesi", 1],
    ["sevgililer:karakter", "Duygusal olgunluk", 2],
    ["sevgililer:karakter", "Mizah", 3],
    ["sevgililer:karakter", "Tutarlılık", 4],
    ["sevgililer:karakter", "Cömertlik / empati", 5],
    ["sevgililer:karakter", "Uyum / iletişim", 6],
    ["sevgililer:fiziksel", "Genel görünüm", 1],
    ["sevgililer:fiziksel", "Stil / bakım", 2],
    ["sevgililer:fiziksel", "Fiziksel çekim / uyum", 3],
    ["sevgililer:fiziksel", "Enerji", 4],
  ];

  return rows.map(([categoryId, label, sortOrder], i) => ({
    id: `${categoryId}:${i}`,
    category_id: categoryId,
    label,
    sort_order: sortOrder,
    active: true,
  }));
}
