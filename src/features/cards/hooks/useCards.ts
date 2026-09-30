import { useState, useEffect, useCallback } from "react";
import type { Card } from "../../../types/card";
import { getAllCards, deleteCard } from "../services/cardService";
import { useAuth } from "../../auth/hooks/useAuth";
import { useToast } from "../../../components/ui/Toast";

export function useCards(initialFilter: string = "all") {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState("");

  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllCards(user, filter, search);
      setCards(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب الكروت");
    } finally {
      setIsLoading(false);
    }
  }, [user, filter, search, toastError]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const removeCard = async (cardId: string) => {
    const res = await deleteCard(cardId);
    if (res.success) {
      success("تم حذف الكارت بنجاح");
      setCards((prev) => prev.filter((c) => c.card_id !== cardId));
    } else {
      toastError(res.error || "فشل في حذف الكارت");
    }
  };

  return {
    cards,
    isLoading,
    filter,
    setFilter,
    search,
    setSearch,
    fetchCards,
    removeCard,
  };
}
