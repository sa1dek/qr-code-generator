import { useState, useEffect, useCallback } from "react";
import type { Card } from "../../../types/card";
import { getUserCards, updateCardDestination } from "../services/userService";
import { useAuth } from "../../auth/hooks/useAuth";
import { useToast } from "../../../components/ui/Toast";

export function useUserCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const fetchCards = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getUserCards(user.id);
      setCards(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب الكروت");
    } finally {
      setIsLoading(false);
    }
  }, [user, toastError]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const updateDestination = async (
    cardId: string,
    targetUrl: string,
    clientName?: string,
  ) => {
    const res = await updateCardDestination(cardId, targetUrl, clientName);
    if (res.success && res.card) {
      success("تم تحديث رابط التوجيه بنجاح");
      setCards((prev) =>
        prev.map((c) => (c.card_id === cardId ? (res.card as Card) : c)),
      );
      return true;
    } else {
      toastError(res.error || "فشل في تحديث الرابط");
      return false;
    }
  };

  return { cards, isLoading, fetchCards, updateDestination };
}
