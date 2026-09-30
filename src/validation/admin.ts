import { ValidationResult } from "./auth";

export function validateBulkCardRange(startId: string, endId: string): ValidationResult {
  const start = (startId || "").trim().toUpperCase();
  const end = (endId || "").trim().toUpperCase();

  if (!start || !end) {
    return { isValid: false, error: "بداية ونهاية النطاق مطلوبتان" };
  }

  const startNum = parseInt(start.replace(/\D/g, ""), 10);
  const endNum = parseInt(end.replace(/\D/g, ""), 10);

  if (isNaN(startNum) || isNaN(endNum)) {
    return { isValid: false, error: "يجب أن يحتوي كل من البداية والنهاية على أرقام" };
  }

  if (startNum > endNum) {
    return { isValid: false, error: "بداية النطاق يجب أن تكون أصغر من نهايته" };
  }

  if (endNum - startNum > 500) {
    return { isValid: false, error: "لا يمكن توليد أكثر من 500 كارت دفعة واحدة" };
  }

  return { isValid: true };
}
