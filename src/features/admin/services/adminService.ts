import { supabase, isSupabaseConfigured } from "../../../lib/supabase/client";
import type { UserProfile, DashboardStats } from "../../../types";
import { getDashboardStats } from "../../cards/services/cardService";

export async function getAllProfiles(): Promise<UserProfile[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as UserProfile[];
}

export async function updateUserRole(
  userId: string,
  newRole: "admin" | "user",
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getAdminMetrics(): Promise<DashboardStats> {
  return getDashboardStats({ id: "admin", role: "admin" });
}
