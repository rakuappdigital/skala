import Link from "next/link";
import { notFound } from "next/navigation";
import { TabNav } from "@/components/TabNav";
import { RankingTable } from "@/components/RankingTable";
import { getRanking } from "@/lib/data";
import { isPersonTab, TAB_LABELS } from "@/lib/types";

// Sıralama her zaman güncel veriyi göstermeli, build-time snapshot değil.
export const dynamic = "force-dynamic";

export default async function TabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  if (!isPersonTab(tab)) notFound();

  const rows = await getRanking(tab);

  return (
    <div className="shell">
      <div className="topbar">
        <span className="wordmark">skala</span>
        <Link href={`/${tab}/yeni`} className="btn btn-primary">
          + Kişi ekle
        </Link>
      </div>
      <TabNav active={tab} />
      <div className="section-title">{TAB_LABELS[tab]} · sıralama</div>
      <RankingTable rows={rows} tab={tab} />
    </div>
  );
}
