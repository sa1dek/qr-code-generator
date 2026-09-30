import React from "react";
import { UserCardsList } from "../../features/user/components/UserCardsList";
import { useUserCards } from "../../features/user/hooks/useUserCards";

interface UserCardsPageProps {
  onShowQR: (card: any) => void;
  onSimulateScan: (card: any) => void;
}

export const UserCardsPage: React.FC<UserCardsPageProps> = ({
  onShowQR,
  onSimulateScan,
}) => {
  const { cards, isLoading, fetchCards } = useUserCards();

  const handleEditCard = (card: any) => {
    // Users can edit their own card destination
    onShowQR(card);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <UserCardsList
        cards={cards}
        isLoading={isLoading}
        onRefresh={fetchCards}
        onEditCard={handleEditCard}
        onShowQR={onShowQR}
        onSimulate={onSimulateScan}
      />
    </div>
  );
};
