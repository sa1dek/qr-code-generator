//--------------|| Auth Validation ||--------------//

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Determines whether a value is a syntactically valid email address
export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test((value || "").trim());
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "البريد الإلكتروني مطلوب" };
  }
  if (!isEmail(trimmed)) {
    return { isValid: false, error: "صيغة البريد الإلكتروني غير صالحة" };
  }
  return { isValid: true };
}

// Usernames are stored lower-cased so uniqueness is case-insensitive,
// mirroring public.profiles + idx_profiles_username_lower in schema.sql.
export function normalizeUsername(username: string): string {
  return (username || "").trim().toLowerCase();
}

// The single message shown whenever a username is already taken.
export const USERNAME_TAKEN_MESSAGE =
  "اسم المستخدم مُستعمل بالفعل، يرجى اختيار اسم آخر";

export function validateUsername(username: string): ValidationResult {
  const normalized = normalizeUsername(username);
  if (!normalized) {
    return { isValid: false, error: "اسم المستخدم مطلوب" };
  }
  if (normalized.length < 3 || normalized.length > 30) {
    return { isValid: false, error: "يجب أن يتراوح اسم المستخدم بين 3 و 30 حرفاً" };
  }
  const usernameRegex = /^[a-z0-9_.-]+$/;
  if (!usernameRegex.test(normalized)) {
    return { isValid: false, error: "اسم المستخدم يمكن أن يحتوي فقط على أحرف إنجليزية، أرقام، شرطات ونقاط" };
  }
  return { isValid: true };
}

// Login accepts either a valid email address or a valid username
export function validateLoginIdentifier(identifier: string): ValidationResult {
  const trimmed = (identifier || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "البريد الإلكتروني أو اسم المستخدم مطلوب" };
  }
  if (isEmail(trimmed)) {
    return { isValid: true };
  }
  const usernameValidation = validateUsername(trimmed);
  if (!usernameValidation.isValid) {
    return {
      isValid: false,
      error: "أدخل بريداً إلكترونياً صحيحاً أو اسم مستخدم صحيح",
    };
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
