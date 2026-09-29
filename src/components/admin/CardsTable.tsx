import React, { useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  QrCode,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  Eye,
  User,
} from "lucide-react";
import { Card, getCardStatus } from "../../types/card";
import { CardRow } from "./CardRow";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { getShortCardUrl } from "../../lib/utils";
import { useToast } from "../ui/Toast";

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
  onSimulateScan: (card: Card) => void;
  onRefresh: () => void;
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
  onSimulateScan,
  onRefresh,
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
      className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
      dir="rtl"
    >
      {/*--------------|| Table Toolbar Header ||--------------*/}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/*--------------|| Search Input ||--------------*/}
        <div className="w-full md:w-80">
          <Input
            placeholder="بحث بمعرف الكارت أو اسم العميل..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
            className="text-xs sm:text-sm"
          />
        </div>

        {/*--------------|| Filters & Action Buttons ||--------------*/}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
          {/*--------------|| Filter Chips ||--------------*/}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl">
            {filters.map((f) => (
              <button
                type="button"
                key={f.id}
                onClick={() => onFilterChange(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                  activeFilter === f.id
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              title="تحديث البيانات"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4">معرف الكارت</th>
              <th className="py-3 px-4">الحالة</th>
              <th className="py-3 px-4">مالك الكارت (User)</th>
              <th className="py-3 px-4">العميل المخصص</th>
              <th className="py-3 px-4">رابط التقييم (Google Review)</th>
              <th className="py-3 px-4 text-center">عمليات المسح</th>
              <th className="py-3 px-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && cards.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-28 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-48 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-4 w-8 bg-slate-100 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-left">
                    <div className="h-6 w-24 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : cards.length > 0 ? (
              cards.map((card: any) => {
                const status = getCardStatus(card);
                return (
                  <tr
                    key={card.card_id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Card ID */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        <span>{card.card_id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(card.card_id)}
                          className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-800"
                          title="نسخ الرابط"
                        >
                          {copiedId === card.card_id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {status === "active" && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          مُفعّل
                        </span>
                      )}
                      {status === "unassigned" && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          غير مخصص
                        </span>
                      )}
                      {status === "inactive" && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          معطل
                        </span>
                      )}
                    </td>

                    {/* Owner Email / User Tag */}
                    <td className="py-4 px-4 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px]">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {card.owner_email || card.user_id || "أدمن النظام"}
                        </span>
                      </span>
                    </td>

                    {/* Client Name */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-800">
                      {card.client_name || "— غير مسمى —"}
                    </td>

                    {/* Target URL */}
                    <td className="py-4 px-4 text-xs font-mono text-slate-600 max-w-xs truncate">
                      {card.target_url ? (
                        <a
                          href={card.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 inline-flex items-center gap-1 truncate dir-ltr text-right"
                        >
                          <span className="truncate">{card.target_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400">لا يوجد رابط</span>
                      )}
                    </td>

                    {/* Scan Count */}
                    <td className="py-4 px-4 text-center font-mono text-xs font-bold text-slate-900">
                      {card.scan_count || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onShowQR(card)}
                          className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="عرض QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSimulateScan(card)}
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                          title="محاكاة مسح"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCard(card)}
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                          title="تعديل الكارت"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCard(card)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
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
                  <p className="text-base font-bold text-slate-800">
                    لا توجد كروت مطابقة
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/*--------------|| Mobile Responsive Cards View ||--------------*/}
      <div className="block md:hidden divide-y divide-slate-100">
        {isLoading && cards.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`m-skel-${i}`} className="p-4 space-y-3 animate-pulse">
              <div className="h-5 w-32 bg-slate-100 rounded" />
              <div className="h-4 w-48 bg-slate-100 rounded" />
              <div className="h-8 w-full bg-slate-100 rounded" />
            </div>
          ))
        ) : cards.length > 0 ? (
          cards.map((card: any) => {
            const status = getCardStatus(card);
            return (
              <div
                key={card.card_id}
                className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors"
              >
                {/* Card ID & Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {card.card_id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(card.card_id)}
                      className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-800"
                      title="نسخ الرابط"
                    >
                      {copiedId === card.card_id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div>
                    {status === "active" && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        مُفعّل
                      </span>
                    )}
                    {status === "unassigned" && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        غير مخصص
                      </span>
                    )}
                    {status === "inactive" && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        معطل
                      </span>
                    )}
                  </div>
                </div>

                {/* Owner Info Tag */}
                <div className="text-xs text-slate-700 flex items-center justify-between bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                  <span className="text-slate-500 text-[11px]">
                    مالك الكارت:
                  </span>
                  <span className="font-mono font-semibold text-indigo-700 text-[11px] truncate max-w-[200px]">
                    {card.owner_email || card.user_id || "أدمن النظام"}
                  </span>
                </div>

                {/* Client Details */}
                <div className="text-xs text-slate-700">
                  <span className="text-slate-400 block text-[11px]">
                    العميل المخصص:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {card.client_name || "— لم يُعيّن عميل بعد —"}
                  </span>
                </div>

                {/* Redirect Target Link */}
                {card.target_url && (
                  <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    <span className="truncate dir-ltr text-right flex-1 text-[11px]">
                      {card.target_url}
                    </span>
                    <a
                      href={card.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-blue-600 hover:text-blue-800 shrink-0 mr-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Mobile Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    المسحات:{" "}
                    <strong className="font-mono text-slate-900 font-bold">
                      {card.scan_count || 0}
                    </strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onShowQR(card)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1"
                      title="عرض QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="text-[11px]">QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSimulateScan(card)}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg"
                      title="تجربة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditCard(card)}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCard(card)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg"
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
            <p className="text-sm font-bold text-slate-700">
              لا توجد كروت حتى الآن
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
