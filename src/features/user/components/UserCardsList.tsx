import React, { useState } from "react";
import { Search, CreditCard, RefreshCw } from "lucide-react";
import type { Card } from "../../../types/card";
import { UserCard } from "./UserCard";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Loading } from "../../../components/ui/Loading";
import { EmptyState } from "../../../components/common/EmptyState";

interface UserCardsListProps {
  cards: Card[];
  isLoading: boolean;
  onRefresh: () => void;
  onEditCard: (card: Card) => void;
  onShowQR: (card: Card) => void;
  onSimulate: (card: Card) => void;
}

export const UserCardsList: React.FC<UserCardsListProps> = ({
  cards,
  isLoading,
  onRefresh,
  onEditCard,
  onShowQR,
  onSimulate,
}) => {
  const [search, setSearch] = useState("");

  const filteredCards = cards.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.card_id.toLowerCase().includes(q) ||
      (c.client_name && c.client_name.toLowerCase().includes(q)) ||
      (c.target_url && c.target_url.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 text-start" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="بحث في كروتك..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={onRefresh}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          تحديث الكروت
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16">
          <Loading text="جاري جلب كروتك..." />
        </div>
      ) : filteredCards.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8 text-brand" />}
          title={search ? "لا توجد نتائج بحث" : "لا توجد كروت مربوطة بحسابك"}
          description={
            search
              ? "لم يتم العثور على أي كارت يطابق كلمة البحث."
              : "تواصل مع مدير النظام لتخصيص كروت NFC و QR جديدة لحسابك."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
            <UserCard
              key={card.card_id}
              card={card}
              onEdit={onEditCard}
              onShowQR={onShowQR}
              onSimulate={onSimulate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
