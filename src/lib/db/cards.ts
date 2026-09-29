import {
  Card,
  CardScan,
  DashboardStats,
  BulkGenerateResult,
  UserRole,
} from "../../types/card";
import { createAdminClient } from "../supabase/admin";
import { createServerClient } from "../supabase/server";

//--------------|| Get All Cards (Filtered by User & Role) ||--------------//
export async function getAllCards(
  search?: string,
  filter?: string,
  user?: { id: string; role: UserRole } | null,
): Promise<Card[]> {
  const client = createAdminClient() || createServerClient();

  if (client) {
    try {
      let query = client
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false });

      // 1. Data Isolation: تصفية البيانات حسب صلاحية المستخدم
      if (!user) {
        // الزائر غير المسجل يرى فقط الكروت العامة (user_id IS NULL)
        query = query.is("user_id", null);
      } else if (user.role !== "admin") {
        // المستخدم العادي يرى كروته الخاصة فقط
        query = query.eq("user_id", user.id);
      }
      // الأدمن (admin) يمر بدون شرط user_id ليرى كل الكروت

      // 2. تصفية حسب حالة الكارت
      if (filter === "active") {
        query = query.eq("is_active", true).not("target_url", "is", null);
      } else if (filter === "unassigned") {
        query = query.or("target_url.is.null,target_url.eq.");
      } else if (filter === "inactive") {
        query = query.eq("is_active", false);
      }

      // 3. البحث
      if (search) {
        query = query.or(
          `card_id.ilike.%${search}%,client_name.ilike.%${search}%`,
        );
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as Card[];
      }
    } catch (err) {
      console.warn("Supabase query failed:", err);
    }
  }

  return [];
}

//--------------|| Get Single Card By ID ||--------------//
export async function getCardById(cardId: string): Promise<Card | null> {
  const normalizedId = cardId.trim().toUpperCase();
  const client = createAdminClient() || createServerClient();

  if (client) {
    try {
      const { data, error } = await client
        .from("cards")
        .select("*")
        .eq("card_id", normalizedId)
        .maybeSingle();

      if (!error && data) {
        return data as Card;
      }
    } catch (err) {
      console.warn("Supabase getCardById failed:", err);
    }
  }

  return null;
}

//--------------|| Create Single Card with User Link ||--------------//
export async function createSingleCard(
  cardId: string,
  userId?: string | null,
): Promise<{ success: boolean; card?: Card; error?: string }> {
  const normalizedId = cardId.trim().toUpperCase();
  const client = createAdminClient();

  if (client) {
    try {
      const { data, error } = await client
        .from("cards")
        .insert({
          card_id: normalizedId,
          user_id: userId || null, // ربط الكارت بالمالك
          client_name: null,
          target_url: null,
          is_active: false,
          scan_count: 0,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return {
            success: false,
            error: "معرف الكارت موجود بالفعل (Duplicate Card ID)",
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, card: data as Card };
    } catch (err: any) {
      return { success: false, error: err.message || "خطأ في إنشاء الكارت" };
    }
  }

  return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
}

//--------------|| Create Bulk Cards with User Link ||--------------//
export async function createBulkCards(
  cardIds: string[],
  userId?: string | null,
): Promise<BulkGenerateResult> {
  const client = createAdminClient();
  const distinctIds = Array.from(
    new Set(cardIds.map((id) => id.trim().toUpperCase())),
  );

  if (client) {
    try {
      const { data: existing } = await client
        .from("cards")
        .select("card_id")
        .in("card_id", distinctIds);

      const existingSet = new Set(
        (existing || []).map((e: { card_id: string }) =>
          e.card_id.toUpperCase(),
        ),
      );
      const toInsertIds = distinctIds.filter((id) => !existingSet.has(id));
      const skippedIds = distinctIds.filter((id) => existingSet.has(id));

      if (toInsertIds.length === 0) {
        return {
          totalCreated: 0,
          totalSkipped: skippedIds.length,
          createdCards: [],
          skippedCardIds: skippedIds,
        };
      }

      const rows = toInsertIds.map((card_id) => ({
        card_id,
        user_id: userId || null,
        client_name: null,
        target_url: null,
        is_active: false,
        scan_count: 0,
      }));

      const { data: inserted, error } = await client
        .from("cards")
        .insert(rows)
        .select();

      if (error) throw error;

      return {
        totalCreated: inserted?.length || 0,
        totalSkipped: skippedIds.length,
        createdCards: (inserted as Card[]) || [],
        skippedCardIds: skippedIds,
      };
    } catch (err) {
      console.warn("Supabase bulk create failed:", err);
    }
  }

  return {
    totalCreated: 0,
    totalSkipped: distinctIds.length,
    createdCards: [],
    skippedCardIds: distinctIds,
  };
}

//--------------|| Update Card Details ||--------------//
export async function updateCard(
  cardId: string,
  updates: Partial<Pick<Card, "client_name" | "target_url" | "is_active">>,
): Promise<{ success: boolean; card?: Card; error?: string }> {
  const normalizedId = cardId.trim().toUpperCase();
  const client = createAdminClient();

  if (client) {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.client_name !== undefined)
        payload.client_name = updates.client_name;
      if (updates.target_url !== undefined)
        payload.target_url = updates.target_url;
      if (updates.is_active !== undefined)
        payload.is_active = updates.is_active;

      const { data, error } = await client
        .from("cards")
        .update(payload)
        .eq("card_id", normalizedId)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, card: data as Card };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
}

//--------------|| Delete Card ||--------------//
export async function deleteCard(
  cardId: string,
): Promise<{ success: boolean; error?: string }> {
  const normalizedId = cardId.trim().toUpperCase();
  const client = createAdminClient();

  if (client) {
    try {
      const { error } = await client
        .from("cards")
        .delete()
        .eq("card_id", normalizedId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
}

//--------------|| Record Scan ||--------------//
export async function recordCardScan(
  cardId: string,
  metadata?: { userAgent?: string; referer?: string; ipHash?: string },
): Promise<void> {
  const normalizedId = cardId.trim().toUpperCase();
  const client = createAdminClient();

  if (client) {
    try {
      await client.from("card_scans").insert({
        card_id: normalizedId,
        user_agent: metadata?.userAgent || null,
        referer: metadata?.referer || null,
        ip_hash: metadata?.ipHash || null,
      });

      const { data: card } = await client
        .from("cards")
        .select("scan_count")
        .eq("card_id", normalizedId)
        .single();

      if (card) {
        await client
          .from("cards")
          .update({ scan_count: (card.scan_count || 0) + 1 })
          .eq("card_id", normalizedId);
      }
    } catch (err) {
      console.warn("Failed recording scan in Supabase:", err);
    }
  }
}

//--------------|| Get Dashboard Stats ||--------------//
export async function getDashboardStats(
  user?: { id: string; role: UserRole } | null,
): Promise<DashboardStats> {
  const cards = await getAllCards(undefined, undefined, user);
  const client = createAdminClient() || createServerClient();

  let recentScans: CardScan[] = [];

  if (client) {
    try {
      const { data } = await client
        .from("card_scans")
        .select("*")
        .order("scanned_at", { ascending: false })
        .limit(10);
      if (data) {
        recentScans = data as CardScan[];
      }
    } catch (err) {
      console.warn("Failed fetching scans:", err);
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
