import { supabase, isSupabaseConfigured } from "../../../lib/supabase/client";
import type { AuthUser, UserProfile, UserRole } from "../../../types";
import type { LoginCredentials, SignUpCredentials } from "../types/auth";

export async function loginWithIdentifier({
  identifier,
  password,
}: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
  if (!isSupabaseConfigured) {
    throw new Error("الاتصال بقاعدة بيانات Supabase غير مهيأ");
  }

  let targetEmail = identifier.trim();

  // إذا لم يكن المدخل إيميل (لا يحتوي على @)، إذن هو اسم مستخدم (Username)
  if (!targetEmail.includes("@")) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", targetEmail.toLowerCase())
      .maybeSingle();

    if (profileError || !profileData?.email) {
      throw new Error("اسم المستخدم (Username) غير موجود في النظام");
    }
    targetEmail = profileData.email;
  }

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "بيانات الدخول أو كلمة المرور غير صحيحة");
  }

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

export async function signUpUser({
  email,
  username,
  password,
}: SignUpCredentials): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("الاتصال بقاعدة بيانات Supabase غير مهيأ");
  }

  const cleanUsername = username.trim().toLowerCase();

  // Check username availability
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", cleanUsername)
    .maybeSingle();

  if (existingProfile) {
    throw new Error("اسم المستخدم (Username) مستخدم بالفعل، اختر اسماً آخر.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        username: cleanUsername,
        role: "user",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("فشل إنشاء الحساب، يرجى المحاولة لاحقاً");
  }
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
