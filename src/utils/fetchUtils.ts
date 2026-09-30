import { supabase } from "../lib/supabase/client";
export { supabase };

//--------------|| Safe JSON Request Helper ||--------------//
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(input, init);
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch {
      // JSON parse failed
    }
  }

  const text = await res.text();
  let cleanMessage = text;

  if (
    text.includes("A server error") ||
    text.includes("FUNCTION_INVOCATION_FAILED")
  ) {
    cleanMessage = "حدث خطأ في الخادم. يرجى التحقق من الاتصال بقاعدة البيانات.";
  } else if (!res.ok) {
    cleanMessage = `خطأ من الخادم (رمز الحالة: ${res.status})`;
  }

  return {
    ok: res.ok,
    status: res.status,
    data: {
      success: false,
      error: cleanMessage,
    } as unknown as T,
  };
}

//--------------|| Fetch All Cards (With User Profile Join) ||--------------//
export async function getCardsApi(user?: { id: string; role: string } | null) {
  let query = supabase
    .from("cards")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false });

  if (user) {
    if (user.role !== "admin") {
      query = query.eq("user_id", user.id);
    }
  } else {
    query = query.is("user_id", null);
  }

  const { data, error } = await query;

  if (error) {
    return {
      ok: false,
      status: 400,
      data: { success: false, error: error.message, cards: [] },
    };
  }

  const formattedCards = (data || []).map((card: any) => ({
    ...card,
    owner_email:
      card.profiles?.email || (card.user_id ? "مستخدم مسجل" : "كارت عام/أدمن"),
  }));

  return {
    ok: true,
    status: 200,
    data: { success: true, cards: formattedCards },
  };
}

//--------------|| Create Single Card ||--------------//
export async function createCardApi(cardId: string, userId?: string | null) {
  const normalizedId = cardId.trim().toUpperCase();

  // جلب الـ ID مباشرة من جلسة Supabase لضمان عدم وجود قيم فارغة
  const { data: sessionData } = await supabase.auth.getSession();
  const currentAuthId = sessionData?.session?.user?.id;

  const finalUserId = userId || currentAuthId || null;

  const { data, error } = await supabase
    .from("cards")
    .insert([
      {
        card_id: normalizedId,
        user_id: finalUserId,
        is_active: false,
        scan_count: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        status: 400,
        data: {
          success: false,
          error: "معرف الكارت موجود بالفعل (Duplicate ID)",
        },
      };
    }
    return {
      ok: false,
      status: 400,
      data: { success: false, error: error.message },
    };
  }

  return { ok: true, status: 200, data: { success: true, card: data } };
}

//--------------|| Bulk Create Cards (With User Link) ||--------------//
export async function createBulkCardsApi(
  startId: string,
  endId: string,
  userId?: string | null,
) {
  const startNum = parseInt(startId.replace(/\D/g, ""), 10);
  const endNum = parseInt(endId.replace(/\D/g, ""), 10);
  const prefix = startId.replace(/\d+/g, "");

  if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
    return {
      ok: false,
      status: 400,
      data: { success: false, error: "نطاق المعرفات غير صالح" },
    };
  }

  const cardsToInsert = [];
  for (let i = startNum; i <= endNum; i++) {
    const formattedId = `${prefix}${String(i).padStart(2, "0")}`.toUpperCase();
    cardsToInsert.push({
      card_id: formattedId,
      user_id: userId || null,
      is_active: false,
      scan_count: 0,
    });
  }

  const { data, error } = await supabase
    .from("cards")
    .insert(cardsToInsert)
    .select();

  if (error) {
    return {
      ok: false,
      status: 400,
      data: { success: false, error: error.message },
    };
  }

  return { ok: true, status: 200, data: { success: true, createdCards: data } };
}

//--------------|| Update Card Details ||--------------//
export async function updateCardApi(
  cardId: string,
  updates: Partial<{
    client_name: string;
    target_url: string;
    is_active: boolean;
  }>,
) {
  const normalizedId = cardId.trim().toUpperCase();
  const { data, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("card_id", normalizedId)
    .select()
    .single();

  if (error) {
    return {
      ok: false,
      status: 400,
      data: { success: false, error: error.message },
    };
  }

  return { ok: true, status: 200, data: { success: true, card: data } };
}

//--------------|| Delete Card ||--------------//
export async function deleteCardApi(cardId: string) {
  const normalizedId = cardId.trim().toUpperCase();
  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("card_id", normalizedId);

  if (error) {
    return {
      ok: false,
      status: 400,
      data: { success: false, error: error.message },
    };
  }

  return { ok: true, status: 200, data: { success: true } };
}
