import {
  Card,
  CardScan,
  DashboardStats,
  BulkGenerateResult,
} from "../../types/card";
import { createAdminClient } from "../supabase/admin";
import { createServerClient } from "../supabase/server";

//--------------|| Initial Mock Seed Data ||--------------//
const INITIAL_MOCK_CARDS: Card[] = [
  {
    id: "c1111111-0000-0000-0000-000000000001",
    card_id: "CARD-001",
    client_name: "مطعم المدينة للمأكولات الشرقية",
    target_url:
      "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
    is_active: true,
    scan_count: 142,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "c1111111-0000-0000-0000-000000000002",
    card_id: "CARD-002",
    client_name: "مقهى الأندلس الفاخر",
    target_url:
      "https://search.google.com/local/writereview?placeid=ChIJs_5N0_k900gR7wXgX123456",
    is_active: true,
    scan_count: 89,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "c1111111-0000-0000-0000-000000000003",
    card_id: "CARD-003",
    client_name: "عيادات النخبة لطب الأسنان",
    target_url:
      "https://search.google.com/local/writereview?placeid=ChIJde_clinic_sample_place_id",
    is_active: true,
    scan_count: 45,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "c1111111-0000-0000-0000-000000000004",
    card_id: "CARD-004",
    client_name: null,
    target_url: null,
    is_active: false,
    scan_count: 0,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "c1111111-0000-0000-0000-000000000005",
    card_id: "CARD-005",
    client_name: null,
    target_url: null,
    is_active: false,
    scan_count: 0,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const INITIAL_MOCK_SCANS: CardScan[] = [
  {
    id: "scan-1",
    card_id: "CARD-001",
    scanned_at: new Date(Date.now() - 20 * 60000).toISOString(),
    user_agent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    referer: "NFC Tag",
    ip_hash: "ip_938ab4c1",
  },
  {
    id: "scan-2",
    card_id: "CARD-001",
    scanned_at: new Date(Date.now() - 50 * 60000).toISOString(),
    user_agent:
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36",
    referer: "QR Code",
    ip_hash: "ip_44a1b023",
  },
  {
    id: "scan-3",
    card_id: "CARD-002",
    scanned_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) Mobile",
    referer: "NFC Tag",
    ip_hash: "ip_11ef8821",
  },
  {
    id: "scan-4",
    card_id: "CARD-003",
    scanned_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    user_agent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/119.0",
    referer: "QR Code",
    ip_hash: "ip_99fa1233",
  },
];

//--------------|| In-Memory Mock Store ||--------------//
let mockCardsStore: Card[] = [...INITIAL_MOCK_CARDS];
let mockScansStore: CardScan[] = [...INITIAL_MOCK_SCANS];

//--------------|| Database Mode Resolver ||--------------//
export function getDatabaseMode(): "supabase" | "mock" {
  const adminClient = createAdminClient() || createServerClient();
  return adminClient ? "supabase" : "mock";
}

//--------------|| Get All Cards with Filtering ||--------------//
export async function getAllCards(
  search?: string,
  filter?: string,
): Promise<Card[]> {
  const client = createAdminClient() || createServerClient();

  if (client) {
    try {
      let query = client
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "active") {
        query = query.eq("is_active", true).not("target_url", "is", null);
      } else if (filter === "unassigned") {
        query = query.or("target_url.is.null,target_url.eq.");
      } else if (filter === "inactive") {
        query = query.eq("is_active", false);
      }

      if (search) {
        query = query.or(
          `card_id.ilike.%${search}%,client_name.ilike.%${search}%`,
        );
      }

      const { data, error } = await query;
      if (error) {
        console.warn(
          "Supabase getAllCards error, falling back to mock:",
          error.message,
        );
      } else if (data) {
        return data as Card[];
      }
    } catch (err) {
      console.warn("Supabase query failed:", err);
    }
  }

  // Mock DB fallback
  let list = [...mockCardsStore];

  if (filter === "active") {
    list = list.filter(
      (c) => c.is_active && c.target_url && c.target_url.trim().length > 0,
    );
  } else if (filter === "unassigned") {
    list = list.filter(
      (c) => !c.target_url || c.target_url.trim().length === 0,
    );
  } else if (filter === "inactive") {
    list = list.filter((c) => !c.is_active);
  }

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.card_id.toLowerCase().includes(s) ||
        (c.client_name && c.client_name.toLowerCase().includes(s)),
    );
  }

  return list.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

//--------------|| Get Card By ID ||--------------//
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

  const found = mockCardsStore.find(
    (c) => c.card_id.toUpperCase() === normalizedId,
  );
  return found || null;
}

//--------------|| Create Single Card ||--------------//
export async function createSingleCard(
  cardId: string,
): Promise<{ success: boolean; card?: Card; error?: string }> {
  const normalizedId = cardId.trim().toUpperCase();
  const client = createAdminClient();

  if (client) {
    try {
      const { data, error } = await client
        .from("cards")
        .insert({
          card_id: normalizedId,
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

  // Mock
  const exists = mockCardsStore.some(
    (c) => c.card_id.toUpperCase() === normalizedId,
  );
  if (exists) {
    return {
      success: false,
      error: "معرف الكارت موجود بالفعل (Duplicate Card ID)",
    };
  }

  const newCard: Card = {
    id: `c-mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    card_id: normalizedId,
    client_name: null,
    target_url: null,
    is_active: false,
    scan_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockCardsStore.unshift(newCard);
  return { success: true, card: newCard };
}

//--------------|| Create Bulk Cards ||--------------//
export async function createBulkCards(
  cardIds: string[],
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
        client_name: null,
        target_url: null,
        is_active: false,
        scan_count: 0,
      }));

      const { data: inserted, error } = await client
        .from("cards")
        .insert(rows)
        .select();

      if (error) {
        throw error;
      }

      return {
        totalCreated: inserted?.length || 0,
        totalSkipped: skippedIds.length,
        createdCards: (inserted as Card[]) || [],
        skippedCardIds: skippedIds,
      };
    } catch (err) {
      console.warn("Supabase bulk create failed, falling back to mock:", err);
    }
  }

  // Mock DB bulk insert
  const created: Card[] = [];
  const skipped: string[] = [];

  for (const id of distinctIds) {
    const exists = mockCardsStore.some((c) => c.card_id.toUpperCase() === id);
    if (exists) {
      skipped.push(id);
    } else {
      const card: Card = {
        id: `c-mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        card_id: id,
        client_name: null,
        target_url: null,
        is_active: false,
        scan_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockCardsStore.unshift(card);
      created.push(card);
    }
  }

  return {
    totalCreated: created.length,
    totalSkipped: skipped.length,
    createdCards: created,
    skippedCardIds: skipped,
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

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, card: data as Card };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Mock
  const index = mockCardsStore.findIndex(
    (c) => c.card_id.toUpperCase() === normalizedId,
  );
  if (index === -1) {
    return { success: false, error: "الكارت غير موجود" };
  }

  const existing = mockCardsStore[index];
  const updated: Card = {
    ...existing,
    client_name:
      updates.client_name !== undefined
        ? updates.client_name
        : existing.client_name,
    target_url:
      updates.target_url !== undefined
        ? updates.target_url
        : existing.target_url,
    is_active:
      updates.is_active !== undefined ? updates.is_active : existing.is_active,
    updated_at: new Date().toISOString(),
  };

  mockCardsStore[index] = updated;
  return { success: true, card: updated };
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

  // Mock
  const initialLen = mockCardsStore.length;
  mockCardsStore = mockCardsStore.filter(
    (c) => c.card_id.toUpperCase() !== normalizedId,
  );
  mockScansStore = mockScansStore.filter(
    (s) => s.card_id.toUpperCase() !== normalizedId,
  );

  if (mockCardsStore.length === initialLen) {
    return { success: false, error: "الكارت غير موجود" };
  }
  return { success: true };
}

//--------------|| Record Card Scan ||--------------//
export async function recordCardScan(
  cardId: string,
  metadata?: { userAgent?: string; referer?: string; ipHash?: string },
): Promise<void> {
  const normalizedId = cardId.trim().toUpperCase();
  const client = createAdminClient();

  if (client) {
    try {
      // 1. Insert scan row
      await client.from("card_scans").insert({
        card_id: normalizedId,
        user_agent: metadata?.userAgent || null,
        referer: metadata?.referer || null,
        ip_hash: metadata?.ipHash || null,
      });

      // 2. Increment scan_count
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
      return;
    } catch (err) {
      console.warn("Failed recording scan in Supabase:", err);
    }
  }

  // Mock
  const cardIndex = mockCardsStore.findIndex(
    (c) => c.card_id.toUpperCase() === normalizedId,
  );
  if (cardIndex !== -1) {
    mockCardsStore[cardIndex].scan_count =
      (mockCardsStore[cardIndex].scan_count || 0) + 1;
  }

  mockScansStore.unshift({
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    card_id: normalizedId,
    scanned_at: new Date().toISOString(),
    user_agent: metadata?.userAgent || null,
    referer: metadata?.referer || null,
    ip_hash: metadata?.ipHash || null,
  });
}

//--------------|| Get Dashboard Stats ||--------------//
export async function getDashboardStats(): Promise<DashboardStats> {
  const cards = await getAllCards();
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
      recentScans = mockScansStore.slice(0, 10);
    }
  } else {
    recentScans = mockScansStore.slice(0, 10);
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
