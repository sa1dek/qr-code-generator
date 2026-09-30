import { useState, useCallback } from "react";
import type { Card } from "../../../types/card";
import { getCardById, updateCard, createSingleCard } from "../services/cardService";
import { useToast } from "../../../components/ui/Toast";

export function useCard(cardId?: string) {
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchCard = useCallback(async (idToFetch?: string) => {
    const id = idToFetch || cardId;
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getCardById(id);
      setCard(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب بيانات الكارت");
    } finally {
      setIsLoading(false);
    }
  }, [cardId, toastError]);

  const saveCard = async (
    updates: Partial<Pick<Card, "client_name" | "target_url" | "is_active">>,
  ) => {
    if (!card?.card_id) return false;
    setIsLoading(true);
    try {
      const res = await updateCard(card.card_id, updates);
      if (res.success && res.card) {
        setCard(res.card);
        success("تم تحديث بيانات الكارت بنجاح");
        return true;
      } else {
        toastError(res.error || "فشل تحديث الكارت");
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createCard = async (id: string, userId?: string | null) => {
    setIsLoading(true);
    try {
      const res = await createSingleCard(id, userId);
      if (res.success && res.card) {
        setCard(res.card);
        success("تم إنشاء الكارت بنجاح");
        return res.card;
      } else {
        toastError(res.error || "فشل إنشاء الكارت");
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    card,
    isLoading,
    fetchCard,
    saveCard,
    createCard,
    setCard,
  };
}
