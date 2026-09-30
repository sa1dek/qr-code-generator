import React, { useState, useEffect, useCallback } from "react";
import { Menu, Plus } from "lucide-react";
import { Sidebar, type AdminTab } from "../../components/layout/Sidebar";
import { DashboardStats } from "../../features/admin/components/DashboardStats";
import { CardsTable } from "../../features/admin/components/CardsTable";
import { AssignCardModal } from "../../features/admin/components/AssignCardModal";
import { GenerateCardsModal } from "../../features/admin/components/GenerateCardsModal";
import { QRCodeModal } from "../../features/admin/components/QRCodeModal";
import { NfcSimulatorModal } from "../../features/admin/components/NfcSimulatorModal";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";
import { AnalyticsView } from "../../features/admin/components/AnalyticsView";
import { DocsView } from "../../features/admin/components/DocsView";
import { Button } from "../../components/ui/Button";
import { AdminUserCardsPage } from "./AdminUserCardsPage";
import { UsersManagementPage } from "../../features/admin/components/UsersManagementPage";
import type {
  AuthUser,
  Card,
  DashboardStats as StatsType,
} from "../../types/card";
import { useToast } from "../../components/ui/Toast";
import { deleteCardApi, unassignCardApi } from "../../utils/fetchUtils";
import { getAdminOnlyCards, getAdminDashboardStats } from "../../features/admin/services/adminService";

interface AdminDashboardPageProps {
  onLogout: () => void;
  dbMode: "supabase" | "mock";
  currentUser?: AuthUser | null;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onLogout,
  dbMode,
  currentUser,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [selectedCardForEdit, setSelectedCardForEdit] = useState<Card | null>(
    null,
  );
  const [selectedCardForQR, setSelectedCardForQR] = useState<Card | null>(null);
  const [selectedCardForSim, setSelectedCardForSim] = useState<Card | null>(
    null,
  );
  const [selectedCardForDelete, setSelectedCardForDelete] =
    useState<Card | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const adminId = currentUser?.id || null;
      const [fetchedCards, fetchedStats] = await Promise.all([
        getAdminOnlyCards(adminId),
        getAdminDashboardStats(adminId),
      ]);

      setCards(fetchedCards);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      error("تعذر جلب البيانات من الخادم");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, error]);

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
    } catch (err: any) {
      error(err.message || "حدث خطأ أثناء الحذف");
      throw err;
    }
  };

  const handleUnassignCard = async (card: Card) => {
    if (!window.confirm(`هل تريد إلغاء تعيين الكارت ${card.card_id} وإعادته للمخزون؟`)) {
      return;
    }

    try {
      const res = await unassignCardApi(card.card_id);
      if (!res.ok) {
        throw new Error(res.data?.error || "تعذر إلغاء تعيين الكارت");
      }

      setCards((prev) =>
        prev.map((c) =>
          c.card_id === card.card_id
            ? { ...c, user_id: null, is_active: false, client_name: null, target_url: null }
            : c,
        ),
      );
      success(`تم إلغاء تعيين الكارت ${card.card_id} بنجاح`);
      fetchData();
    } catch (err: any) {
      error(err.message || "حدث خطأ أثناء إلغاء التعيين");
      throw err;
    }
  };

  const handleCardUpdated = (updatedCard: Card) => {
    setCards((prev) =>
      prev.map((c) => (c.card_id === updatedCard.card_id ? updatedCard : c)),
    );
    fetchData();
  };

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.card_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.client_name &&
        card.client_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "active") return card.is_active && card.client_name;
    if (activeFilter === "unassigned") return !card.client_name;
    if (activeFilter === "inactive") return !card.is_active && card.client_name;

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
              {currentTab === "dashboard" && "لوحة التحكم الرئيسية"}
              {currentTab === "cards" && "إدارة كروت NFC & QR"}
              {currentTab === "user-cards" && "كروت المستخدمين"}
              {currentTab === "users-management" && "إدارة المستخدمين والصلاحيات"}
              {currentTab === "analytics" && "تحليلات المسح والزيارات"}
              {currentTab === "docs" && "دليل الاستخدام والبرمجة"}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">إضافة كروت جديدة</span>
              <span className="sm:hidden">إضافة</span>
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full">
          {currentTab === "dashboard" && (
            <div className="space-y-6">
              <DashboardStats stats={stats} isLoading={isLoading} />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-text-primary">
                    قائمة الكروت الديناميكية
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
                  onUnassignCard={handleUnassignCard}
                  onSimulateScan={setSelectedCardForSim}
                  onRefresh={fetchData}
                />
              </div>
            </div>
          )}

          {currentTab === "cards" && (
            <div className="space-y-4">
              <div className="surface-elevated p-4 sm:p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-text-primary">
                    إدارة وبرمجة الكروت
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    قم بتخصيص روابط التقييم، وتوليد كروت جديدة، وتنزيل رموز QR
                    المخصصة.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto shrink-0"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  إضافة كروت جديدة
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
                onUnassignCard={handleUnassignCard}
                onSimulateScan={setSelectedCardForSim}
                onRefresh={fetchData}
              />
            </div>
          )}

          {currentTab === "user-cards" && (
            <AdminUserCardsPage
              adminId={currentUser?.id || null}
              onShowQR={setSelectedCardForQR}
              onSimulateScan={setSelectedCardForSim}
            />
          )}

          {currentTab === "users-management" && <UsersManagementPage />}

          {currentTab === "analytics" && (
            <AnalyticsView
              cards={cards}
              recentScans={stats?.recentScans || []}
              isLoading={isLoading}
              onRefresh={fetchData}
            />
          )}

          {currentTab === "docs" && <DocsView />}
        </main>
      </div>

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

      <GenerateCardsModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
        currentUser={currentUser}
        allowAssignToUser
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