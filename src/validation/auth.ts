//--------------|| Auth Validation ||--------------//

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "البريد الإلكتروني مطلوب" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "صيغة البريد الإلكتروني غير صالحة" };
  }
  return { isValid: true };
}

export function validateUsername(username: string): ValidationResult {
  const trimmed = (username || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "اسم المستخدم مطلوب" };
  }
  if (trimmed.length < 3 || trimmed.length > 30) {
    return { isValid: false, error: "يجب أن يتراوح اسم المستخدم بين 3 و 30 حرفاً" };
  }
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { isValid: false, error: "اسم المستخدم يمكن أن يحتوي فقط على أحرف، أرقام، شرطات ونقاط" };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "كلمة المرور مطلوبة" };
  }
  if (password.length < 8) {
    return { isValid: false, error: "يجب ألا تقل كلمة المرور عن 8 أحرف" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل" };
  }
  return { isValid: true };
}
