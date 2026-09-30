//--------------|| Formatting Utilities ||--------------//

export function formatNumber(num: number, locale: string = "ar-EG"): string {
  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch {
    return String(num);
  }
}

export function formatCardId(id: string): string {
  return (id || "").trim().toUpperCase();
}

export function truncateText(text: string, maxLength: number = 30): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
