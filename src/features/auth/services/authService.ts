import { supabase, isSupabaseConfigured } from "../../../lib/supabase/client";
import type { AuthUser, UserProfile, UserRole } from "../../../types";
import type { LoginCredentials, SignUpCredentials, SignUpResult } from "../types/auth";
import {
  isEmail,
  normalizeUsername,
  USERNAME_TAKEN_MESSAGE,
} from "../../../validation/auth";

//--------------|| Shared Auth Error Messages ||--------------//
const INVALID_CREDENTIALS_MESSAGE = "اسم المستخدم أو كلمة المرور غير صحيحة";
const USERNAME_NOT_FOUND_MESSAGE = "اسم المستخدم غير موجود";
const LOOKUP_FAILED_MESSAGE = "تعذر التحقق من اسم المستخدم، يرجى المحاولة مرة أخرى";

// Supabase returns raw English auth errors; map credential failures to a clean message
function resolveAuthErrorMessage(message?: string): string {
  if (!message) return INVALID_CREDENTIALS_MESSAGE;
  const isCredentialFailure =
    /invalid login credentials|user not found|wrong (email|password)|invalid email or password|email not confirmed/i.test(
      message,
    );
  return isCredentialFailure ? INVALID_CREDENTIALS_MESSAGE : message;
}

// handle_new_user() raises on a duplicate/invalid username. Supabase surfaces the
// trigger failure through a generic "Database error saving new user", so match on
// the known markers as a safety net for races the pre-check cannot see.
function resolveSignUpErrorMessage(message?: string): string {
  if (!message) return "فشل إنشاء الحساب، يرجى المحاولة لاحقاً";
  if (/username_taken|already (been )?registered|duplicate key|profiles_username/i.test(message)) {
    return USERNAME_TAKEN_MESSAGE;
  }
  if (/invalid_username/i.test(message)) {
    return "اسم المستخدم غير صالح، يرجى اختيار اسم آخر";
  }
  return message;
}

//--------------|| Resend Verification Email ||--------------//
const RESEND_FAILED_MESSAGE = "تعذّر إعادة إرسال رسالة التأكيد، يرجى المحاولة لاحقاً";

function resolveResendErrorMessage(message?: string): string {
  if (!message) return RESEND_FAILED_MESSAGE;
  if (/rate limit|too many|for security purposes|seconds/i.test(message)) {
    return "تم إرسال عدد كبير من الطلبات، يرجى الانتظار قليلاً ثم المحاولة مرة أخرى";
  }
  return message;
}

//--------------|| Pending Verification Email (sessionStorage) ||--------------//
// The e-mail address is kept in sessionStorage rather than the router state or
// the query string so the confirmation screen survives a refresh and no PII
// ends up in the URL / browser history. Cleared when the tab is closed.
const PENDING_VERIFICATION_EMAIL_KEY = "review_cards_pending_verification_email";

export function savePendingVerificationEmail(email: string): void {
  try {
    window.sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
  } catch {
    // Private mode / disabled storage: the screen simply asks for the address.
  }
}

export function getPendingVerificationEmail(): string {
  try {
    return window.sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function clearPendingVerificationEmail(): void {
  try {
    window.sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
  } catch {
    // no-op
  }
}

export async function loginWithIdentifier({
  identifier,
  password,
}: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
  if (!isSupabaseConfigured) {
    throw new Error("الاتصال بقاعدة بيانات Supabase غير مهيأ");
  }

  const cleanIdentifier = identifier.trim();
  let targetEmail = cleanIdentifier;

  // إذا لم يكن المدخل بريداً إلكترونياً صالحاً، فسيُعامل كاسم مستخدم (Username)
  if (!isEmail(cleanIdentifier)) {
    // Profiles are hidden from other users by RLS, so the lookup must go
    // through the SECURITY DEFINER RPC from schema.sql.
    const { data: resolvedEmail, error: lookupError } = await supabase.rpc(
      "email_for_username",
      { p_username: normalizeUsername(cleanIdentifier) },
    );

    if (lookupError) {
      // Do not report a lookup/RLS failure as "username not found"
      throw new Error(LOOKUP_FAILED_MESSAGE);
    }

    if (!resolvedEmail) {
      throw new Error(USERNAME_NOT_FOUND_MESSAGE);
    }

    targetEmail = resolvedEmail;
  }

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

  if (authError || !authData.user) {
    throw new Error(resolveAuthErrorMessage(authError?.message));
  }

  // Reaching a real session means any pending e-mail confirmation is done.
  clearPendingVerificationEmail();

  // Fetch profile to get role and username
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, username")
    .eq("id", authData.user.id)
    .maybeSingle();

  const role: UserRole = (profile?.role as UserRole) || "user";
  const token = authData.session?.access_token || "";

  const user: AuthUser = {
    id: authData.user.id,
    email: authData.user.email || targetEmail,
    username: profile?.username || undefined,
    role,
    token,
  };

  return { user, token };
}

// Back-end half of the uniqueness check: asks the database whether the
// username is free. The plain SELECT this used to do was silently blocked by
// the profiles RLS policy for non-admin users, so it never detected a clash.
export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const cleanUsername = normalizeUsername(username);
  if (!cleanUsername) return false;

  const { data, error } = await supabase.rpc("username_exists", {
    p_username: cleanUsername,
  });

  if (error) {
    // Availability is advisory; let the caller fall through to the real check.
    console.warn("Username availability check failed:", error.message);
    return true;
  }

  return !data;
}

export async function signUpUser({
  email,
  username,
  password,
}: SignUpCredentials): Promise<SignUpResult> {
  if (!isSupabaseConfigured) {
    throw new Error("الاتصال بقاعدة بيانات Supabase غير مهيأ");
  }

  const cleanUsername = normalizeUsername(username);

  if (!cleanUsername) {
    throw new Error("اسم المستخدم مطلوب");
  }

  // Server-side uniqueness gate. handle_new_user() enforces the same rule, so
  // this is not the only line of defence - it just produces a clear message.
  if (!(await isUsernameAvailable(cleanUsername))) {
    throw new Error(USERNAME_TAKEN_MESSAGE);
  }

  const cleanEmail = email.trim();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        username: cleanUsername,
        role: "user",
      },
    },
  });

  if (error) {
    throw new Error(resolveSignUpErrorMessage(error.message));
  }

  if (!data.user) {
    throw new Error("فشل إنشاء الحساب، يرجى المحاولة لاحقاً");
  }

  // Supabase returns a session only when "Confirm email" is disabled for the
  // project. Without one the account exists but sign-in is still blocked.
  const requiresEmailConfirmation = !data.session;

  savePendingVerificationEmail(cleanEmail);

  return { email: cleanEmail, requiresEmailConfirmation };
}

// Re-sends the "confirm your e-mail" message for a pending signup.
export async function resendVerificationEmail(email: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("الاتصال بقاعدة بيانات Supabase غير مهيأ");
  }

  const cleanEmail = email.trim();

  if (!isEmail(cleanEmail)) {
    throw new Error("صيغة البريد الإلكتروني غير صالحة");
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: cleanEmail,
  });

  if (error) {
    throw new Error(resolveResendErrorMessage(error.message));
  }

  savePendingVerificationEmail(cleanEmail);
}

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as UserProfile;
}
