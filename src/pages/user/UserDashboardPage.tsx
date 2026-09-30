import React, { useState, useEffect, useCallback } from "react";
import { Menu, Plus } from "lucide-react";
import { Sidebar, type UserTab } from "../../components/layout/Sidebar";
import { DashboardStats } from "../../features/admin/components/DashboardStats";
import { CardsTable } from "../../features/admin/components/CardsTable";
import { GenerateCardsModal } from "../../features/admin/components/GenerateCardsModal";
import { AssignCardModal } from "../../features/admin/components/AssignCardModal";
import { QRCodeModal } from "../../features/admin/components/QRCodeModal";
import { NfcSimulatorModal } from "../../features/admin/components/NfcSimulatorModal";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";
import { DocsView } from "../../features/admin/components/DocsView";
import { Button } from "../../components/ui/Button";
import type { AuthUser, Card } from "../../types/card";
import { useToast } from "../../components/ui/Toast";
import { getCardsApi, deleteCardApi } from "../../utils/fetchUtils";
import { useUserStats } from "../../features/user/hooks/useUserStats";

interface UserDashboardPageProps {
  onLogout: () => void;
  dbMode: "supabase" | "mock";
  currentUser?: AuthUser | null;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  onLogout,
  dbMode,
  currentUser,
}) => {
  const [currentTab, setCurrentTab] = useState<UserTab>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [selectedCardForQR, setSelectedCardForQR] = useState<Card | null>(null);
  const [selectedCardForSim, setSelectedCardForSim] = useState<Card | null>(null);
  const [selectedCardForDelete, setSelectedCardForDelete] = useState<Card | null>(null);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<Card | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { stats, isLoading: statsLoading, refetch: refetchStats } = useUserStats();
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCardsApi(currentUser);
      if (res.ok && res.data?.cards) {
        setCards(res.data.cards);
      } else {
        error(res.data?.error || "تعذر جلب البيانات من الخادم");
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      error("تعذر جلب البيانات من الخادم");
    } finally {
      setIsLoading(false);
    }
  }, [error, currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirmDelete = async (cardId: string) => {
    try {
      const res = await deleteCardApi(cardId);
      if (!res.ok) {
        throw new Error(res.data?.error || "تعذر حذف الكارت");
      }
      setCards((prev) =>
        prev.filter((c) => c.card_id.toUpperCase() !== cardId.toUpperCase()),
      );
      success(`تم حذف الكارت ${cardId} بنجاح`);
      fetchData();
      refetchStats();
    } catch (err: any) {
      error(err.message || "حدث خطأ أثناء الحذف");
      throw err;
    }
  };

  const handleCardUpdated = (updatedCard: Card) => {
    setCards((prev) =>
      prev.map((c) => (c.card_id === updatedCard.card_id ? updatedCard : c)),
    );
    fetchData();
    refetchStats();
  };

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.card_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.client_name &&
        card.client_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "active") return card.is_active && card.target_url;
    if (activeFilter === "unassigned") return !card.target_url;
    if (activeFilter === "inactive") return !card.is_active && card.target_url;

    return true;
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden" dir="rtl">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        dbMode={dbMode}
        onLogout={onLogout}
        currentUser={currentUser}
        role="user"
      />

      <div className="md:mr-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-surface-900/90 backdrop-blur-md border-b border-border-subtle px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 shrink-0 rounded-xl border border-border-subtle text-text-secondary hover:bg-surface-800 hover:border-brand/40 transition-all duration-200 ease-out-expo active:scale-90"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-sm sm:text-base lg:text-lg font-bold text-text-primary truncate">
              {currentTab === "dashboard" && "لوحة التحكم"}
              {currentTab === "my-cards" && "كروتي"}
              {currentTab === "docs" && "دليل الاستخدام والبرمجة"}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">إضافة كارت</span>
              <span className="sm:hidden">إضافة</span>
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full">
          {currentTab === "dashboard" && (
            <div className="space-y-6">
              <DashboardStats stats={stats} isLoading={statsLoading} />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-text-primary">
                    قائمة كروتك
                  </h2>
                </div>

                <CardsTable
                  cards={filteredCards}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onEditCard={setSelectedCardForEdit}
                  onShowQR={setSelectedCardForQR}
                  onDeleteCard={(card) => setSelectedCardForDelete(card)}
                  onSimulateScan={setSelectedCardForSim}
                  onRefresh={fetchData}
                  role="user"
                />
              </div>
            </div>
          )}

          {currentTab === "my-cards" && (
            <div className="space-y-4">
              <div className="surface-elevated p-4 sm:p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-text-primary">
                    إدارة كروتك
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    أضف كروت جديدة، وخصص روابط التقييم، وولّد رموز QR مخصصة.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto shrink-0"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  إضافة كارت جديد
                </Button>
              </div>

              <CardsTable
                cards={filteredCards}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onEditCard={setSelectedCardForEdit}
                onShowQR={setSelectedCardForQR}
                onDeleteCard={(card) => setSelectedCardForDelete(card)}
                onSimulateScan={setSelectedCardForSim}
                onRefresh={fetchData}
                role="user"
              />
            </div>
          )}

          {currentTab === "docs" && <DocsView />}
        </main>
      </div>

      <GenerateCardsModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
        currentUser={currentUser}
        mode="single"
      />

      <AssignCardModal
        card={selectedCardForEdit}
        isOpen={Boolean(selectedCardForEdit)}
        onClose={() => setSelectedCardForEdit(null)}
        onSuccess={handleCardUpdated}
        onDeleteCard={(card) => {
          setSelectedCardForEdit(null);
          setSelectedCardForDelete(card);
        }}
      />

      <QRCodeModal
        card={selectedCardForQR}
        isOpen={Boolean(selectedCardForQR)}
        onClose={() => setSelectedCardForQR(null)}
      />

      <NfcSimulatorModal
        card={selectedCardForSim}
        isOpen={Boolean(selectedCardForSim)}
        onClose={() => setSelectedCardForSim(null)}
        onScanRecorded={fetchData}
      />

      <DeleteConfirmModal
        card={selectedCardForDelete}
        isOpen={Boolean(selectedCardForDelete)}
        onClose={() => setSelectedCardForDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};