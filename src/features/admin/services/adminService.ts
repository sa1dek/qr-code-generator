import { supabase, isSupabaseConfigured } from "../../../lib/supabase/client";
import type {
  UserProfile,
  UserRole,
  DashboardStats,
  Card,
} from "../../../types";

/**
 * The admin's primary card inventory: the unassigned system pool (`user_id IS
 * NULL`) plus every card the logged-in admin owns outright (`user_id = adminId`).
 *
 * Both halves have to be in here. Cards created from the admin dashboard are
 * stamped with the admin's own id so they are attributable, which means a plain
 * `user_id IS NULL` filter would hide them from the very table and the
 * "إجمالي الكروت" counter they are supposed to be counted in.
 */
export async function getAdminOnlyCards(
  adminId?: string | null,
): Promise<Card[]> {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from("cards")
      .select("*, profiles(email)")
      .order("created_at", { ascending: false });

    query = adminId
      ? query.or(`user_id.is.null,user_id.eq.${adminId}`)
      : query.is("user_id", null);

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((card: any) => ({
      ...card,
      owner_email:
        card.user_id && card.user_id !== adminId
          ? card.profiles?.email || "مستخدم مسجل"
          : "كارت نظام/أدمن",
    })) as Card[];
  } catch (err) {
    console.warn("adminService.getAdminOnlyCards error:", err);
    return [];
  }
}

/**
 * Cards owned by registered clients, i.e. the "كروت المستخدمين" view.
 *
 * `adminId` is excluded so the admin's own system cards are not reported as
 * client cards and are not double-counted in both dashboards.
 */
export async function getUserAssignedCards(
  adminId?: string | null,
): Promise<Card[]> {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from("cards")
      .select("*, profiles(email)")
      .not("user_id", "is", null)
      .order("created_at", { ascending: false });

    if (adminId) {
      query = query.neq("user_id", adminId);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((card: any) => ({
      ...card,
      owner_email:
        card.profiles?.email || "مستخدم مسجل",
    })) as Card[];
  } catch (err) {
    console.warn("adminService.getUserAssignedCards error:", err);
    return [];
  }
}

export async function getAdminDashboardStats(
  adminId?: string | null,
): Promise<DashboardStats> {
  const cards = await getAdminOnlyCards(adminId);

  let recentScans: any[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from("card_scans")
        .select("*")
        .order("scanned_at", { ascending: false })
        .limit(10);
      if (data) {
        recentScans = data;
      }
    } catch (err) {
      console.warn("Failed fetching recent scans:", err);
    }
  }

  let activeCount = 0;
  let unassignedCount = 0;
  let inactiveCount = 0;
  let totalScans = 0;

  for (const c of cards) {
    totalScans += c.scan_count || 0;
    if (c.is_active && c.target_url && c.target_url.trim().length > 0) {
      activeCount++;
    } else if (!c.target_url || c.target_url.trim().length === 0) {
      unassignedCount++;
    } else {
      inactiveCount++;
    }
  }

  return {
    totalCards: cards.length,
    activeCards: activeCount,
    unassignedCards: unassignedCount,
    inactiveCards: inactiveCount,
    totalScans,
    recentScans,
  };
}

export async function getAllProfiles(): Promise<{
  users: UserProfile[];
  error: string | null;
}> {
  if (!isSupabaseConfigured) {
    return { users: [], error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { users: [], error: error?.message || "فشل في جلب قائمة المستخدمين" };
  }
  return { users: data as UserProfile[], error: null };
}

// The RPCs raise `code: readable message`, and PostgREST hands the whole string
// back as `error.message`. Strip the machine-readable prefix so the toast only
// shows the sentence the user can act on.
function toReadableError(message?: string | null): string | undefined {
  if (!message) return undefined;
  const separatorIndex = message.indexOf(": ");
  return separatorIndex === -1
    ? message
    : message.slice(separatorIndex + 2).trim();
}

/**
 * Promote or demote a user. Goes through public.admin_set_role() instead of a
 * plain table update, because `profiles.role` is no longer writable directly and
 * the RPC also blocks self-demotion and removing the last admin.
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const { error } = await supabase.rpc("admin_set_role", {
    p_user_id: userId,
    p_role: newRole,
  });

  if (error) {
    return {
      success: false,
      error: toReadableError(error.message) || "فشل تحديث الصلاحية",
    };
  }

  return { success: true };
}

/**
 * Delete a user and all of their data. Calls public.delete_user_completely(),
 * a SECURITY DEFINER RPC that removes the auth.users row (cascading to
 * public.profiles) and releases their cards back to the unassigned admin pool.
 */
export async function deleteUserCompletely(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const { data, error } = await supabase.rpc("delete_user_completely", {
    p_target_user_id: userId,
  });

  if (error) {
    return {
      success: false,
      error:
        toReadableError(error.message) || "فشل في حذف المستخدم، حاول مرة أخرى",
    };
  }

  if (data === false) {
    return { success: false, error: "تعذر حذف المستخدم، حاول مرة أخرى" };
  }

  return { success: true };
}

export async function unassignCard(
  cardId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const normalizedId = cardId.trim().toUpperCase();
  const { error } = await supabase
    .from("cards")
    .update({
      user_id: null,
      is_active: false,
      client_name: null,
      target_url: null,
    })
    .eq("card_id", normalizedId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteCard(
  cardId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const normalizedId = cardId.trim().toUpperCase();
  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("card_id", normalizedId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
