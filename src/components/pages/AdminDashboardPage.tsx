import React, { useState, useEffect, useCallback } from "react";
import { Menu, Plus } from "lucide-react";
import { Sidebar, type AdminTab } from "../admin/Sidebar";
import { DashboardStats } from "../admin/DashboardStats";
import { CardsTable } from "../admin/CardsTable";
import { AssignCardModal } from "../admin/AssignCardModal";
import { GenerateCardsModal } from "../admin/GenerateCardsModal";
import { QRCodeModal } from "../admin/QRCodeModal";
import { NfcSimulatorModal } from "../admin/NfcSimulatorModal";
import { DeleteConfirmModal } from "../admin/DeleteConfirmModal";
import { AnalyticsView } from "../admin/AnalyticsView";
import { DocsView } from "../admin/DocsView";
import { Button } from "../ui/Button";
import { UserCardsPage } from "./UserCardsPage";
import { UsersManagementPage } from "../admin/UsersManagementPage";
import type {
  AuthUser,
  Card,
  DashboardStats as StatsType,
} from "../../types/card";
import { useToast } from "../ui/Toast";
import { getCardsApi, deleteCardApi } from "../../lib/fetchUtils";

//--------------|| Component Props Interface ||--------------//
interface AdminDashboardPageProps {
  onLogout: () => void;
  dbMode: "supabase" | "mock";
  currentUser?: AuthUser | null;
}

//--------------|| Admin Dashboard Page Component ||--------------//
export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onLogout,
  dbMode,
  currentUser,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  //--------------|| Data States ||--------------//
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  //--------------|| Modal Visibility States ||--------------//
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

  //--------------|| Fetch Data Handler ||--------------//
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCardsApi(currentUser);

      if (res.ok && res.data?.cards) {
        const fetchedCards = res.data.cards;

        // 👇 استبدل الفلترة القديمة بهذه الصياغة الدقيقة لتصفية كروت الأدمن الشخصية فقط وتجاهل كروت المستخدمين
        const adminCards = fetchedCards.filter(
          (c: any) => !c.user_id || c.user_id === currentUser?.id,
        );
        setCards(adminCards);

        //--------------|| Calculate Statistics (لأدمن النظام فقط) ||--------------//
        const totalCards = adminCards.length;
        const activeCards = adminCards.filter(
          (c) => c.is_active && c.client_name,
        ).length;
        const unassignedCards = adminCards.filter((c) => !c.client_name).length;
        const inactiveCards = adminCards.filter(
          (c) => !c.is_active && c.client_name,
        ).length;
        const totalScans = adminCards.reduce(
          (acc, c) => acc + (c.scan_count || 0),
          0,
        );

        setStats({
          totalCards,
          activeCards,
          unassignedCards,
          inactiveCards,
          totalScans,
          recentScans: [],
        } as unknown as StatsType);
      } else {
        error(res.data?.error || "تعذر جلب البيانات من الخادم");
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      error("تعذر جلب البيانات من الخادم");
    } finally {
      setIsLoading(false);
    }
  }, [error, currentUser, searchQuery, activeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //--------------|| Card Deletion Handler ||--------------//
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

  //--------------|| Card Update Handler ||--------------//
  const handleCardUpdated = (updatedCard: Card) => {
    setCards((prev) =>
      prev.map((c) => (c.card_id === updatedCard.card_id ? updatedCard : c)),
    );
    fetchData();
  };

  //--------------|| Filter Cards Logic ||--------------//
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
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {/*--------------|| Sidebar Navigation ||--------------*/}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        dbMode={dbMode}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      {/*--------------|| Main Content Area ||--------------*/}
      <div className="md:mr-64 flex flex-col min-h-screen">
        {/*--------------|| Top Navbar Header ||--------------*/}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                {currentTab === "dashboard" && "لوحة التحكم الرئيسية"}
                {currentTab === "cards" && "إدارة كروت NFC & QR"}
                {currentTab === "user-cards" && "كروت المستخدمين"}
                {currentTab === "analytics" && "تحليلات المسح والزيارات"}
                {currentTab === "docs" && "دليل الاستخدام والبرمجة"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/*--------------|| Main Tab Views ||--------------*/}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full">
          {/*--------------|| Dashboard Overview Tab ||--------------*/}
          {currentTab === "dashboard" && (
            <div className="space-y-6">
              <DashboardStats stats={stats} isLoading={isLoading} />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">
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
                  onSimulateScan={setSelectedCardForSim}
                  onRefresh={fetchData}
                />
              </div>
            </div>
          )}

          {/*--------------|| Dedicated Cards Manager Tab ||--------------*/}
          {currentTab === "cards" && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    إدارة وبرمجة الكروت
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    قم بتخصيص روابط التقييم، وتوليد كروت جديدة، وتنزيل رموز QR
                    المخصصة.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
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
                onSimulateScan={setSelectedCardForSim}
                onRefresh={fetchData}
              />
            </div>
          )}

          {/*--------------|| User Cards Dedicated Tab ||--------------*/}
          {currentTab === "user-cards" && (
            <UserCardsPage
              onShowQR={setSelectedCardForQR}
              onSimulateScan={setSelectedCardForSim}
            />
          )}

          {currentTab === "users-management" && <UsersManagementPage />}

          {/*--------------|| Scan Analytics Tab ||--------------*/}
          {currentTab === "analytics" && (
            <AnalyticsView
              cards={cards}
              recentScans={stats?.recentScans || []}
              isLoading={isLoading}
              onRefresh={fetchData}
            />
          )}

          {/*--------------|| Documentation Guide Tab ||--------------*/}
          {currentTab === "docs" && <DocsView />}
        </main>
      </div>

      {/*--------------|| Application Modals ||--------------*/}
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
