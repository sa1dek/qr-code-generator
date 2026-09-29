//--------------|| Validation Result Interface ||--------------//
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

//--------------|| Card ID Validation ||--------------//
export function validateCardId(cardId: string): ValidationResult {
  const trimmed = (cardId || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "معرف الكارت مطلوب (Card ID)" };
  }
  if (trimmed.length < 3 || trimmed.length > 50) {
    return { isValid: false, error: "يجب أن يكون طول المعرف بين 3 و 50 حرفًا" };
  }
  // Alphanumeric with hyphens/underscores
  const pattern = /^[A-Za-z0-9_-]+$/;
  if (!pattern.test(trimmed)) {
    return {
      isValid: false,
      error:
        "معرف الكارت يجب أن يحتوي فقط على أحرف وأرقام وشرطات (مثل: CARD-001)",
    };
  }
  return { isValid: true };
}

//--------------|| URL Normalization Helper ||--------------//
export function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";
  // If protocol missing (e.g. google.com or mydomain.vercel.app), auto-prepend https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

//--------------|| Target URL Validation ||--------------//
export function validateTargetUrl(
  url: string | null | undefined,
  isRequired: boolean = true,
): ValidationResult {
  if (!url || !url.trim()) {
    if (isRequired) {
      return { isValid: false, error: "رابط التوجيه (Target URL) مطلوب" };
    }
    return { isValid: true };
  }

  const normalized = normalizeUrl(url);

  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname || parsed.hostname.indexOf(".") === -1) {
      return {
        isValid: false,
        error: "عنوان URL غير صالح (يجب أن يحتوي على نطاق مثل google.com)",
      };
    }
  } catch {
    return { isValid: false, error: "صيغة الرابط غير صحيحة" };
  }

  return { isValid: true };
}

//--------------|| Client Name Validation ||--------------//
export function validateClientName(
  name: string | null | undefined,
): ValidationResult {
  if (name && name.trim().length > 100) {
    return {
      isValid: false,
      error: "اسم العميل طويل جدًا (الحد الأقصى 100 حرف)",
    };
  }
  return { isValid: true };
}

//--------------|| Card Range Types & Parser ||--------------//
export interface ParsedRange {
  prefix: string;
  start: number;
  end: number;
  padLength: number;
}

export function parseCardRange(
  startStr: string,
  endStr: string,
): { parsed?: ParsedRange; error?: string } {
  const s = (startStr || "").trim().toUpperCase();
  const e = (endStr || "").trim().toUpperCase();

  if (!s || !e) {
    return {
      error: "يرجى إدخال بداية ونهاية النطاق (مثال: CARD-100 إلى CARD-150)",
    };
  }

  // Regex to extract prefix and trailing digits
  const matchS = s.match(/^(.*?)(\d+)$/);
  const matchE = e.match(/^(.*?)(\d+)$/);

  if (!matchS || !matchE) {
    return { error: "يجب أن ينتهي المعرف بأرقام متسلسلة (مثال: CARD-001)" };
  }

  const prefixS = matchS[1];
  const prefixE = matchE[1];

  if (prefixS !== prefixE) {
    return {
      error: `البادئة غير متطابقة: (${prefixS}) مختلفة عن (${prefixE})`,
    };
  }

  const numS = parseInt(matchS[2], 10);
  const numE = parseInt(matchE[2], 10);

  if (numS > numE) {
    return { error: "رقم البداية يجب أن يكون أصغر أو يساوي رقم النهاية" };
  }

  const total = numE - numS + 1;
  if (total > 500) {
    return { error: "الحد الأقصى لإنشاء الكروت في الدفعة الواحدة هو 500 كارت" };
  }

  const padLength = matchS[2].length;

  return {
    parsed: {
      prefix: prefixS,
      start: numS,
      end: numE,
      padLength,
    },
  };
}
