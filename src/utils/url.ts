//--------------|| URL Utilities ||--------------//

export function getBaseAppUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:5173";
}

export function getShortCardUrl(cardId: string, baseOrigin?: string): string {
  const origin = baseOrigin || getBaseAppUrl();
  return `${origin.replace(/\/+$/, "")}/r/${encodeURIComponent((cardId || "").trim().toUpperCase())}`;
}

export function ensureUrlProtocol(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidUrl(url: string): boolean {
  try {
    const withProto = ensureUrlProtocol(url);
    new URL(withProto);
    return true;
  } catch {
    return false;
  }
}
