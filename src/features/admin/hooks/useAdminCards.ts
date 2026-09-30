import { useState, useEffect, useCallback } from "react";
import type { Card } from "../../../types/card";
import { getAdminOnlyCards, getUserAssignedCards } from "../services/adminService";
import { useToast } from "../../../components/ui/Toast";

export type AdminCardFilter = "admin-only" | "user-assigned" | "all";

export function useAdminCards(initialFilter: AdminCardFilter = "admin-only") {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<AdminCardFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const { error: toastError } = useToast();

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: Card[] = [];
      if (filter === "admin-only") {
        data = await getAdminOnlyCards();
      } else if (filter === "user-assigned") {
        data = await getUserAssignedCards();
      } else {
        const [adminCards, userCards] = await Promise.all([
          getAdminOnlyCards(),
          getUserAssignedCards(),
        ]);
        data = [...adminCards, ...userCards].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      }
      setCards(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب الكروت");
    } finally {
      setIsLoading(false);
    }
  }, [filter, toastError]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.card_id.toLowerCase().includes(search.toLowerCase()) ||
      (card.client_name &&
        card.client_name.toLowerCase().includes(search.toLowerCase())) ||
      (card.owner_email &&
        card.owner_email.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  return {
    cards: filteredCards,
    allCards: cards,
    isLoading,
    filter,
    setFilter,
    search,
    setSearch,
    fetchCards,
  };
}
