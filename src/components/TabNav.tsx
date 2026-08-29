import Link from "next/link";
import { TAB_LABELS, type PersonTab } from "@/lib/types";

export function TabNav({ active }: { active: PersonTab }) {
  const tabs: PersonTab[] = ["arkadaslar", "sevgililer"];
  return (
    <nav className="tabnav">
      {tabs.map((tab) => (
        <Link key={tab} href={`/${tab}`} className={tab === active ? "active" : ""}>
          {TAB_LABELS[tab]}
        </Link>
      ))}
    </nav>
  );
}
