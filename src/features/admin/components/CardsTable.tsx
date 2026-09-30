import React, { useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  QrCode,
  Copy,
  Edit2,
  Trash2,
  Check,
  Eye,
  User,
  UserMinus,
} from "lucide-react";
import { Card } from "../../../types/card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getShortCardUrl } from "../../../utils/utils";
import { useToast } from "../../../components/ui/Toast";
import { CardStatusBadge } from "../../cards/components/CardStatus";

//--------------|| Component Props Interface ||--------------//
interface CardsTableProps {
  cards: Card[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  onOpenCreateModal: () => void;
  onEditCard: (card: Card) => void;
  onShowQR: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
  /** Admin-only: returns an assigned card to the unassigned inventory. */
  onUnassignCard?: (card: Card) => void;
  onSimulateScan: (card: Card) => void;
  onRefresh: () => void;
  role?: "admin" | "user";
}

//--------------|| Cards Table Component ||--------------//
export const CardsTable: React.FC<CardsTableProps> = ({
  cards,
  isLoading,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onOpenCreateModal,
  onEditCard,
  onShowQR,
  onDeleteCard,
  onUnassignCard,
  onSimulateScan,
  onRefresh,
  role = "admin",
}) => {
  const { success } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  //--------------|| Filter Options ||--------------//
  const filters = [
    { id: "all", label: "الكل" },
    { id: "active", label: "المفعلة" },
    { id: "unassigned", label: "غير مخصصة" },
    { id: "inactive", label: "معطلة" },
  ];

  //--------------|| Copy Link Handler ||--------------//
  const handleCopyLink = (cardId: string) => {
    navigator.clipboard.writeText(getShortCardUrl(cardId));
    setCopiedId(cardId);
    success("تم نسخ الرابط المختصر للكارت");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="bg-surface-850 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden"
      dir="rtl"
    >
      {/*--------------|| Table Toolbar Header ||--------------*/}
      <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/*--------------|| Search Input ||--------------*/}
        <div className="w-full md:w-80">
          <Input
            placeholder="بحث بمعرف الكارت أو اسم العميل..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
            className="text-xs sm:text-sm"
          />
        </div>

        {/*--------------|| Filters & Action Buttons ||--------------*/}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
          {/*--------------|| Filter Chips ||--------------*/}
          <div className="flex items-center gap-1 p-1 bg-surface-800/80 rounded-xl border border-border-subtle max-w-full overflow-x-auto">
            {filters.map((f) => (
              <button
                type="button"
                key={f.id}
                onClick={() => onFilterChange(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ease-out-expo select-none whitespace-nowrap ${
                  activeFilter === f.id
                    ? "bg-brand text-text-inverse shadow-2xs"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-750"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              title="تحديث البيانات"
              className="p-2 rounded-xl border border-border-subtle bg-surface-800 text-text-muted hover:text-text-primary hover:bg-surface-750 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            <Button
              type="button"
              size="sm"
              onClick={onOpenCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              إضافة كروت
            </Button>
          </div>
        </div>
      </div>

      {/*--------------|| Desktop Table View ||--------------*/}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-surface-800/60 border-b border-border-subtle text-text-muted text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4">معرف الكارت</th>
              <th className="py-3 px-4">الحالة</th>
              {role === "admin" && (
                <th className="py-3 px-4">مالك الكارت (User)</th>
              )}
              <th className="py-3 px-4">العميل المخصص</th>
              <th className="py-3 px-4">رابط التقييم (Google Review)</th>
              <th className="py-3 px-4 text-center">عمليات المسح</th>
              <th className="py-3 px-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading && cards.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-surface-800 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-surface-800 rounded-full" />
                  </td>
                  {role === "admin" && (
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-surface-800 rounded" />
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-surface-800 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-48 bg-surface-800 rounded" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-4 w-8 bg-surface-800 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-left">
                    <div className="h-6 w-24 bg-surface-800 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : cards.length > 0 ? (
              cards.map((card: any) => {
                return (
                  <tr
                    key={card.card_id}
                    className="hover:bg-surface-800/40 transition-colors duration-150"
                  >
                    {/* Card ID */}
                    <td className="py-4 px-4 font-mono font-bold text-text-primary text-xs">
                      <div className="flex items-center gap-2">
                        <span>{card.card_id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(card.card_id)}
                          className="p-1 rounded-md bg-surface-800 text-text-muted hover:text-text-primary transition-colors"
                          title="نسخ الرابط"
                        >
                          {copiedId === card.card_id ? (
                            <Check className="w-3 h-3 text-status-active-icon" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <CardStatusBadge card={card} size="sm" />
                    </td>

                    {role === "admin" && (
                      <td className="py-4 px-4 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-status-info-bg text-status-info-text border border-status-info-border font-mono text-[11px]">
                          <User className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {card.owner_email || card.user_id || "أدمن النظام"}
                          </span>
                        </span>
                      </td>
                    )}

                    {/* Client Name */}
                    <td className="py-4 px-4 text-xs font-semibold text-text-secondary">
                      {card.client_name || "— غير مسمى —"}
                    </td>

                    {/* Target URL */}
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

                    {/* Scan Count */}
                    <td className="py-4 px-4 text-center font-mono text-xs font-bold text-text-primary">
                      {card.scan_count || 0}
                    </td>

                    {/* Actions */}
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
                        {role === "admin" && card.user_id && onUnassignCard && (
                          <button
                            type="button"
                            onClick={() => onUnassignCard(card)}
                            className="p-1.5 bg-status-unassigned-bg text-status-unassigned-icon hover:bg-status-unassigned-border rounded-lg transition-colors"
                            title="إلغاء تعيين الكارت (إرجاع للمخزون)"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditCard(card)}
                          className="p-1.5 bg-surface-800 text-text-muted hover:text-text-primary hover:bg-surface-750 rounded-lg transition-colors"
                          title="تعديل الكارت"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCard(card)}
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
                <td colSpan={role === "admin" ? 7 : 6} className="py-12 text-center">
                  <p className="text-base font-bold text-text-secondary">
                    لا توجد كروت مطابقة
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/*--------------|| Mobile Responsive Cards View ||--------------*/}
      <div className="block md:hidden divide-y divide-border-subtle">
        {isLoading && cards.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`m-skel-${i}`} className="p-4 space-y-3 animate-pulse">
              <div className="h-5 w-32 bg-surface-800 rounded" />
              <div className="h-4 w-48 bg-surface-800 rounded" />
              <div className="h-8 w-full bg-surface-800 rounded" />
            </div>
          ))
        ) : cards.length > 0 ? (
          cards.map((card: any) => {
            return (
              <div
                key={card.card_id}
                className="p-4 space-y-3 hover:bg-surface-800/40 transition-colors duration-150"
              >
                {/* Card ID & Status Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-sm font-bold text-text-primary truncate">
                      {card.card_id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(card.card_id)}
                      className="p-1 rounded-md bg-surface-800 text-text-muted hover:text-text-primary transition-colors"
                      title="نسخ الرابط"
                    >
                      {copiedId === card.card_id ? (
                        <Check className="w-3.5 h-3.5 text-status-active-icon" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <CardStatusBadge card={card} size="sm" />
                </div>

                {/* Client Details */}
                <div className="text-xs">
                  <span className="text-text-muted block text-[11px]">
                    العميل المخصص:
                  </span>
                  <span className="font-semibold text-text-primary">
                    {card.client_name || "— لم يُعيّن عميل بعد —"}
                  </span>
                </div>

                {role === "admin" && (
                  <div className="text-xs flex items-center justify-between bg-status-info-bg/60 p-2 rounded-lg border border-status-info-border">
                    <span className="text-text-muted text-[11px]">
                      مالك الكارت:
                    </span>
                    <span className="font-mono font-semibold text-status-info-text text-[11px] truncate max-w-[200px]">
                      {card.owner_email || card.user_id || "أدمن النظام"}
                    </span>
                  </div>
                )}

                {/* Redirect Target Link */}
                {card.target_url && (
                  <a
                    href={card.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs font-mono text-text-muted hover:text-brand bg-surface-800/60 p-2 rounded-lg border border-border-subtle transition-colors truncate dir-ltr text-right"
                  >
                    <span className="text-[11px]">{card.target_url}</span>
                  </a>
                )}

                {/* Mobile Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle text-xs">
                  <span className="text-text-muted shrink-0">
                    المسحات:{" "}
                    <strong className="font-mono text-text-primary font-bold">
                      {card.scan_count || 0}
                    </strong>
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onShowQR(card)}
                      className="p-1.5 bg-status-info-bg text-status-info-icon hover:bg-status-info-border rounded-lg font-medium flex items-center gap-1 transition-colors"
                      title="عرض QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="text-[11px]">QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSimulateScan(card)}
                      className="p-1.5 bg-surface-800 text-text-muted hover:text-text-primary hover:bg-surface-750 rounded-lg transition-colors"
                      title="تجربة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {role === "admin" && card.user_id && onUnassignCard && (
                      <button
                        type="button"
                        onClick={() => onUnassignCard(card)}
                        className="p-1.5 bg-status-unassigned-bg text-status-unassigned-icon hover:bg-status-unassigned-border rounded-lg transition-colors"
                        title="إلغاء تعيين الكارت"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEditCard(card)}
                      className="p-1.5 bg-surface-800 text-text-muted hover:text-text-primary hover:bg-surface-750 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCard(card)}
                      className="p-1.5 bg-status-danger-bg text-status-danger-icon hover:bg-status-danger-border rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center p-4">
            <p className="text-sm font-bold text-text-secondary">
              لا توجد كروت حتى الآن
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
