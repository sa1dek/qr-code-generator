//--------------|| Classnames Joining Helper ||--------------//
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

//--------------|| Date Time Formatting Helper ||--------------//
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoString;
  }
}

//--------------|| Relative Date Formatting Helper ||--------------//
export function formatDateRelative(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "منذ لحظات";
    if (diffSec < 3600) return `منذ ${Math.floor(diffSec / 60)} دقيقة`;
    if (diffSec < 86400) return `منذ ${Math.floor(diffSec / 3600)} ساعة`;
    return `منذ ${Math.floor(diffSec / 86400)} يوم`;
  } catch {
    return isoString;
  }
}

//--------------|| Base App URL Retrieval ||--------------//
export function getBaseAppUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

//--------------|| Short Card URL Builder ||--------------//
export function getShortCardUrl(cardId: string, baseOrigin?: string): string {
  const origin = baseOrigin || getBaseAppUrl();
  return `${origin.replace(/\/+$/, "")}/r/${encodeURIComponent(cardId)}`;
}

//--------------|| IP Anonymization Hash Helper ||--------------//
export function hashIpAddress(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "ip_" + Math.abs(hash).toString(16);
}
