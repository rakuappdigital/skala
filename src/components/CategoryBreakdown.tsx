import type { CategoryScoreRow } from "@/lib/types";

export function CategoryBreakdown({ categories }: { categories: CategoryScoreRow[] }) {
  if (categories.length === 0) {
    return <p className="uploader-hint">Henüz hiçbir kritere puan verilmedi.</p>;
  }

  return (
    <div>
      {categories.map((cat) => (
        <div className="category-bar" key={cat.category_id}>
          <div className="category-bar-head">
            <span className="label">{cat.category_label}</span>
            <span className="value mono">{cat.category_avg.toFixed(1)}</span>
          </div>
          <div className="category-bar-track">
            <div
              className="category-bar-fill"
              style={{ width: `${Math.min(100, (cat.category_avg / 10) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
