import { supabase, isSupabaseConfigured } from "../../../lib/supabase/client";
import type { Card } from "../../../types/card";
import type { UserProfile, UserUpdateData } from "../../../types/user";
import { getAllCards, updateCard } from "../../cards/services/cardService";

export async function getUserCards(userId: string): Promise<Card[]> {
  return getAllCards({ id: userId, role: "user" });
}

export async function updateCardDestination(
  cardId: string,
  targetUrl: string,
  clientName?: string,
): Promise<{ success: boolean; card?: Card; error?: string }> {
  return updateCard(cardId, {
    target_url: targetUrl,
    client_name: clientName,
    is_active: Boolean(targetUrl && targetUrl.trim().length > 0),
  });
}

export async function updateUserProfile(
  userId: string,
  data: UserUpdateData,
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "تعذر الاتصال بقاعدة البيانات" };
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, profile: updated as UserProfile };
}
