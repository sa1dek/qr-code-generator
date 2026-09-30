import { supabase, isSupabaseConfigured } from "../../../lib/supabase/client";
import type { Card, DashboardStats, CardScan, BulkGenerateResult } from "../../../types/card";

//--------------|| Fetch All Cards ||--------------//
export async function getAllCards(
  user?: { id: string; role: string } | null,
  filter?: string,
  search?: string,
): Promise<Card[]> {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from("cards")
      .select("*, profiles(email)")
      .order("created_at", { ascending: false });

    // Isolation: non-admins only see cards assigned to them
    if (user) {
      if (user.role !== "admin") {
        query = query.eq("user_id", user.id);
      }
    } else {
      query = query.is("user_id", null);
    }

    if (filter === "active") {
      query = query.eq("is_active", true);
    } else if (filter === "inactive") {
      query = query.eq("is_active", false);
    }

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`card_id.ilike.%${q}%,client_name.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((card: any) => ({
      ...card,
      owner_email:
        card.profiles?.email || (card.user_id ? "مستخدم مسجل" : "كارت عام/أدمن"),
    })) as Card[];
  } catch (err) {
    console.warn("cardService.getAllCards error:", err);
    return [];
  }
}

//--------------|| Fetch Single Card By ID ||--------------//
export async function getCardById(cardId: string): Promise<Card | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const normalizedId = cardId.trim().toUpperCase();
    const { data, error } = await supabase
      .from("cards")
      .select("*, profiles(email)")
      .eq("card_id", normalizedId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      owner_email:
        data.profiles?.email || (data.user_id ? "مستخدم مسجل" : "كارت عام/أدمن"),
    } as Card;
  } catch (err) {
    console.warn("cardService.getCardById error:", err);
    return null;
  }
}

//--------------|| Create Single Card ||--------------//
export async function createSingleCard(
  cardId: string,
  userId?: string | null,
): Promise<{ success: boolean; card?: Card; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const normalizedId = cardId.trim().toUpperCase();
  const { data: sessionData } = await supabase.auth.getSession();
  const currentAuthId = sessionData?.session?.user?.id;
  const finalUserId = userId || currentAuthId || null;

  const { data, error } = await supabase
    .from("cards")
    .insert([
      {
        card_id: normalizedId,
        user_id: finalUserId,
        client_name: null,
        target_url: null,
        is_active: false,
        scan_count: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "معرف الكارت موجود بالفعل (Duplicate ID)" };
    }
    return { success: false, error: error.message };
  }

  return { success: true, card: data as Card };
}

//--------------|| Create Bulk Cards ||--------------//
export async function createBulkCards(
  startId: string,
  endId: string,
  userId?: string | null,
): Promise<BulkGenerateResult> {
  const startNum = parseInt(startId.replace(/\D/g, ""), 10);
  const endNum = parseInt(endId.replace(/\D/g, ""), 10);
  const prefix = startId.replace(/\d+/g, "");

  if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
    return {
      totalCreated: 0,
      totalSkipped: 0,
      createdCards: [],
      skippedCardIds: [],
    };
  }

  const distinctIds: string[] = [];
  for (let i = startNum; i <= endNum; i++) {
    distinctIds.push(`${prefix}${String(i).padStart(2, "0")}`.toUpperCase());
  }

  if (!isSupabaseConfigured) {
    return {
      totalCreated: 0,
      totalSkipped: distinctIds.length,
      createdCards: [],
      skippedCardIds: distinctIds,
    };
  }

  try {
    const { data: existing } = await supabase
      .from("cards")
      .select("card_id")
      .in("card_id", distinctIds);

    const existingSet = new Set((existing || []).map((e: any) => e.card_id.toUpperCase()));
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

    const { data: inserted, error } = await supabase
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
    console.warn("cardService.createBulkCards error:", err);
    return {
      totalCreated: 0,
      totalSkipped: distinctIds.length,
      createdCards: [],
      skippedCardIds: distinctIds,
    };
  }
}

//--------------|| Update Card Details ||--------------//
export async function updateCard(
  cardId: string,
  updates: Partial<Pick<Card, "client_name" | "target_url" | "is_active">>,
): Promise<{ success: boolean; card?: Card; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const normalizedId = cardId.trim().toUpperCase();
  const { data, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("card_id", normalizedId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, card: data as Card };
}

//--------------|| Delete Card ||--------------//
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

  if (error) return { success: false, error: error.message };
  return { success: true };
}

//--------------|| Record Scan ||--------------//
export async function recordCardScan(
  cardId: string,
  metadata?: { userAgent?: string; referer?: string; ipHash?: string },
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const normalizedId = cardId.trim().toUpperCase();

  try {
    await supabase.from("card_scans").insert({
      card_id: normalizedId,
      user_agent: metadata?.userAgent || null,
      referer: metadata?.referer || null,
      ip_hash: metadata?.ipHash || null,
    });

    const { data: card } = await supabase
      .from("cards")
      .select("scan_count")
      .eq("card_id", normalizedId)
      .single();

    if (card) {
      await supabase
        .from("cards")
        .update({
          scan_count: (card.scan_count || 0) + 1,
          last_scanned_at: new Date().toISOString(),
        })
        .eq("card_id", normalizedId);
    }
  } catch (err) {
    console.warn("Failed recording scan:", err);
  }
}

//--------------|| Get Dashboard Stats ||--------------//
export async function getDashboardStats(
  user?: { id: string; role: string } | null,
): Promise<DashboardStats> {
  const cards = await getAllCards(user);

  let recentScans: CardScan[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from("card_scans")
        .select("*")
        .order("scanned_at", { ascending: false })
        .limit(10);
      if (data) {
        recentScans = data as CardScan[];
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
