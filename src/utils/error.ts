//--------------|| Error Parsing Utilities ||--------------//

export function getErrorMessage(error: unknown, fallback: string = "حدث خطأ غير متوقع"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

export function handleSupabaseError(error: { message?: string; code?: string } | null): string {
  if (!error) return "";
  if (error.code === "23505") {
    return "هذا السجل موجود بالفعل (قيمة مكررة).";
  }
  if (error.code === "42501") {
    return "ليس لديك الصلاحية الكافية لإتمام هذا الإجراء.";
  }
  return error.message || "حدث خطأ أثناء الاتصال بقاعدة البيانات.";
}
