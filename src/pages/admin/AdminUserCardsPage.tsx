import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  QrCode,
  Trash2,
  Eye,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  UserMinus,
  Edit2,
} from "lucide-react";
import { Card } from "../../types/card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { deleteCardApi, unassignCardApi } from "../../utils/fetchUtils";
import { getUserAssignedCards } from "../../features/admin/services/adminService";
import { AssignCardModal } from "../../features/admin/components/AssignCardModal";
import { CardStatusBadge } from "../../features/cards/components/CardStatus";

interface AdminUserCardsPageProps {
  /** Logged-in admin, excluded so their system cards are not listed here. */
  adminId?: string | null;
  onShowQR: (card: Card) => void;
  onSimulateScan: (card: Card) => void;
}

export const AdminUserCardsPage: React.FC<AdminUserCardsPageProps> = ({
  adminId,
  onShowQR,
  onSimulateScan,
}) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<Card | null>(null);
  const { success, error: toastError } = useToast();

  const fetchUserCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCards = await getUserAssignedCards(adminId);
      setCards(fetchedCards);
    } catch {
      toastError("فشل في جلب كروت المستخدمين");
    }
    setIsLoading(false);
  }, [adminId, toastError]);

  useEffect(() => {
    fetchUserCards();
  }, [fetchUserCards]);

  const handleDeleteCard = async (card: Card) => {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف الكارت ${card.card_id} الخاص بالمستخدم؟`,
      )
    )
      return;

    const res = await deleteCardApi(card.card_id);
    if (res.ok) {
      success("تم حذف الكارت بنجاح");
      setCards(cards.filter((c) => c.card_id !== card.card_id));
    } else {
      toastError(res.data.error || "فشل حذف الكارت");
    }
  };

  const handleUnassignCard = async (card: Card) => {
    if (!window.confirm(`هل تريد إلغاء تعيين الكارت ${card.card_id} وإعادته للمخزون؟`)) {
      return;
    }

    const res = await unassignCardApi(card.card_id);
    if (res.ok) {
      success("تم إلغاء تعيين الكارت بنجاح");
      setCards(
        cards.map((c) =>
          c.card_id === card.card_id
            ? { ...c, user_id: null, is_active: false, client_name: null, target_url: null }
            : c,
        ),
      );
    } else {
      toastError(res.data.error || "فشل إلغاء تعيين الكارت");
    }
  };

  const handleEditCard = (card: Card) => {
    setSelectedCardForEdit(card);
  };

  const handleCardUpdated = (updatedCard: Card) => {
    setCards((prev) =>
      prev.map((c) => (c.card_id === updatedCard.card_id ? updatedCard : c)),
    );
    setSelectedCardForEdit(null);
  };

  const filteredCards = cards.filter((card: any) => {
    const q = searchQuery.toLowerCase();
    return (
      card.card_id.toLowerCase().includes(q) ||
      card.client_name?.toLowerCase().includes(q) ||
      card.owner_email?.toLowerCase().includes(q)
    );
  });

  const totalUserCards = cards.length;
  const activeUserCards = cards.filter(
    (c: any) => c.is_active && c.client_name,
  ).length;
  const unassignedUserCards = cards.filter((c: any) => !c.client_name).length;
  const totalUserScans = cards.reduce(
    (acc: number, c: any) => acc + (c.scan_count || 0),
    0,
  );

  const statCards = [
    {
      id: "user-cards-total",
      label: "إجمالي كروت المستخدمين",
      value: totalUserCards,
      icon: CreditCard,
      valueClass: "text-text-primary",
      iconClass: "bg-brand/10 text-brand border-brand/20",
    },
    {
      id: "user-cards-active",
      label: "الكروت المفعّلة",
      value: activeUserCards,
      icon: CheckCircle2,
      valueClass: "text-status-active-text",
      iconClass:
        "bg-status-active-bg text-status-active-icon border-status-active-border",
    },
    {
      id: "user-cards-unassigned",
      label: "الكروت غير المخصصة",
      value: unassignedUserCards,
      icon: AlertCircle,
      valueClass: "text-status-unassigned-text",
      iconClass:
        "bg-status-unassigned-bg text-status-unassigned-icon border-status-unassigned-border",
    },
    {
      id: "user-cards-scans",
      label: "إجمالي مسحات المستخدمين",
      value: totalUserScans,
      icon: RefreshCw,
      valueClass: "text-status-info-text",
      iconClass:
        "bg-status-info-bg text-status-info-icon border-status-info-border",
    },
  ];

  return (
    <>
      <div className="space-y-6" dir="rtl">
        <div className="surface-elevated p-4 sm:p-6 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
                <User className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">
                كروت المستخدمين
              </h1>
            </div>
            <p className="text-xs text-text-muted">
              متابعة وإدارة جميع الكروت التي أنشأها المستخدمون المسجلون في النظام
              بشكل مستقل.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={fetchUserCards}
            className="w-full sm:w-auto shrink-0"
            leftIcon={
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            }
          >
            تحديث القائمة
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="surface rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-3 hover:border-border-muted transition-colors duration-200"
              >
                <div className="min-w-0">
                  <p className="text-xs text-text-muted font-medium">
                    {stat.label}
                  </p>
                  <h3
                    className={`text-xl sm:text-2xl font-bold mt-1 font-mono ${stat.valueClass}`}
                  >
                    {stat.value.toLocaleString()}
                  </h3>
                </div>
                <div
                  className={`p-3 rounded-xl border shrink-0 ${stat.iconClass}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface-850 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <Input
                placeholder="بحث بمعرف الكارت، اسم العميل، أو إيميل المستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftElement={<Search className="w-4 h-4" />}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-surface-800/60 border-b border-border-subtle text-text-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">معرف الكارت</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">مالك الكارت (المستخدم)</th>
                  <th className="py-3 px-4">العميل المخصص</th>
                  <th className="py-3 px-4">رابط التقييم</th>
                  <th className="py-3 px-4 text-center">المسحات</th>
                  <th className="py-3 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-surface-800 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 w-16 bg-surface-800 rounded-full" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 bg-surface-800 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-surface-800 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-36 bg-surface-800 rounded" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="h-4 w-8 bg-surface-800 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-left">
                        <div className="h-6 w-20 bg-surface-800 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredCards.length > 0 ? (
                  filteredCards.map((card: any) => {
                    return (
                      <tr
                        key={card.card_id}
                        className="hover:bg-surface-800/40 transition-colors duration-150"
                      >
                        <td className="py-4 px-4 font-mono font-bold text-text-primary text-xs">
                          {card.card_id}
                        </td>
                        <td className="py-4 px-4">
                          <CardStatusBadge card={card} size="sm" />
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-status-info-bg text-status-info-text border border-status-info-border font-mono text-[11px]">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {card.owner_email || card.user_id}
                            </span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-text-secondary">
                          {card.client_name || "— لم يُعيّن —"}
                        </td>
                        <td className="py-4 px-4 text-xs font-mono text-text-muted max-w-xs truncate">
                          {card.target_url ? (
                            <a
                              href={card.target_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-brand transition-colors block truncate dir-ltr text-right"
                            >
                              <span className="truncate">{card.target_url}</span>
                            </a>
                          ) : (
                            <span className="text-text-disabled">لا يوجد رابط</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-xs font-bold text-text-primary">
                          {card.scan_count || 0}
                        </td>
                        <td className="py-4 px-4 text-left">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onShowQR(card)}
                              className="p-1.5 bg-status-info-bg text-status-info-icon hover:bg-status-info-border rounded-lg transition-colors"
                              title="عرض QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSimulateScan(card)}
                              className="p-1.5 bg-surface-800 text-text-muted hover:text-text-primary hover:bg-surface-750 rounded-lg transition-colors"
                              title="محاكاة مسح"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditCard(card)}
                              className="p-1.5 bg-surface-800 text-text-muted hover:text-text-primary hover:bg-surface-750 rounded-lg transition-colors"
                              title="تعديل الكارت"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUnassignCard(card)}
                              className="p-1.5 bg-status-unassigned-bg text-status-unassigned-icon hover:bg-status-unassigned-border rounded-lg transition-colors"
                              title="إلغاء تعيين الكارت (إرجاع للمخزون)"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(card)}
                              className="p-1.5 bg-status-danger-bg text-status-danger-icon hover:bg-status-danger-border rounded-lg transition-colors"
                              title="حذف الكارت"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <p className="text-base font-bold text-text-secondary">
                        لا توجد كروت للمستخدمين حتى الآن
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/*--------------|| Mobile Card List ||--------------*/}
        <div className="md:hidden divide-y divide-border-subtle">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`m-skel-${i}`} className="p-4 space-y-3 animate-pulse">
                <div className="h-5 w-28 bg-surface-800 rounded" />
                <div className="h-4 w-40 bg-surface-800 rounded" />
                <div className="h-9 w-full bg-surface-800 rounded-xl" />
              </div>
            ))
          ) : filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <div key={card.card_id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-text-primary truncate">
                    {card.card_id}
                  </span>
                  <CardStatusBadge card={card} size="sm" />
                </div>

                <p className="text-xs text-text-secondary font-semibold truncate">
                  {card.client_name || "— لم يُعيّن —"}
                </p>

                <div className="flex items-center justify-between gap-2 bg-status-info-bg/60 p-2 rounded-lg border border-status-info-border">
                  <span className="text-[11px] text-text-muted shrink-0">
                    المالك:
                  </span>
                  <span className="font-mono font-semibold text-status-info-text text-[11px] truncate">
                    {card.owner_email || card.user_id}
                  </span>
                </div>

                {card.target_url && (
                  <a
                    href={card.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs font-mono text-text-muted bg-surface-800/60 p-2 rounded-lg border border-border-subtle transition-colors dir-ltr text-right"
                  >
                    <span className="block truncate text-[11px]">
                      {card.target_url}
                    </span>
                  </a>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle">
                  <span className="text-[11px] text-text-muted">
                    المسحات:{" "}
                    <strong className="font-mono font-bold text-text-primary">
                      {card.scan_count || 0}
                    </strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onShowQR(card)}
                      className="p-2 bg-status-info-bg text-status-info-icon rounded-lg transition-colors"
                      title="عرض QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSimulateScan(card)}
                      className="p-2 bg-surface-800 text-text-muted rounded-lg transition-colors"
                      title="محاكاة مسح"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditCard(card)}
                      className="p-2 bg-surface-800 text-text-muted rounded-lg transition-colors"
                      title="تعديل الكارت"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnassignCard(card)}
                      className="p-2 bg-status-unassigned-bg text-status-unassigned-icon rounded-lg transition-colors"
                      title="إلغاء تعيين الكارت"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card)}
                      className="p-2 bg-status-danger-bg text-status-danger-icon rounded-lg transition-colors"
                      title="حذف الكارت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-sm font-bold text-text-secondary">
              لا توجد كروت للمستخدمين حتى الآن
            </p>
          )}
        </div>
      </div>

      <AssignCardModal
        card={selectedCardForEdit}
        isOpen={Boolean(selectedCardForEdit)}
        onClose={() => setSelectedCardForEdit(null)}
        onSuccess={handleCardUpdated}
        onDeleteCard={(card) => handleDeleteCard(card)}
      />
    </>
  );
};
