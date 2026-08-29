export function formatRelative(iso: string | null): string {
  if (!iso) return "henüz puanlanmadı";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} gün önce`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} ay önce`;
  const years = Math.round(months / 12);
  return `${years} yıl önce`;
}
