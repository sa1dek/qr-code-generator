import { ValidationResult, validateEmail, validateUsername } from "./auth";

export function validateUserProfileUpdate(data: { email?: string; username?: string }): ValidationResult {
  if (data.email) {
    const emailRes = validateEmail(data.email);
    if (!emailRes.isValid) return emailRes;
  }
  if (data.username) {
    const usernameRes = validateUsername(data.username);
    if (!usernameRes.isValid) return usernameRes;
  }
  return { isValid: true };
}
