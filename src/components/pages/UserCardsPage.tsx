import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  QrCode,
  ExternalLink,
  Trash2,
  Eye,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, getCardStatus } from "../../types/card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { getCardsApi, deleteCardApi } from "../../lib/fetchUtils";

interface UserCardsPageProps {
  onShowQR: (card: Card) => void;
  onSimulateScan: (card: Card) => void;
}

export const UserCardsPage: React.FC<UserCardsPageProps> = ({
  onShowQR,
  onSimulateScan,
}) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { success, error: toastError } = useToast();

  const fetchUserCards = async () => {
    setIsLoading(true);
    const res = await getCardsApi({ id: "admin", role: "admin" });
    if (res.ok && res.data.cards) {
      // جلب كروت المستخدمين فقط (التي تحتوي على user_id)
      const filtered = res.data.cards.filter((c: any) => c.user_id);
      setCards(filtered);
    } else {
      toastError("فشل في جلب كروت المستخدمين");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserCards();
  }, []);

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

  const filteredCards = cards.filter((card: any) => {
    const q = searchQuery.toLowerCase();
    return (
      card.card_id.toLowerCase().includes(q) ||
      card.client_name?.toLowerCase().includes(q) ||
      card.owner_email?.toLowerCase().includes(q)
    );
  });

  // حساب إحصائيات كروت المستخدمين وحدها
  const totalUserCards = cards.length;
  const activeUserCards = cards.filter(
    (c: any) => c.is_active && c.client_name,
  ).length;
  const unassignedUserCards = cards.filter((c: any) => !c.client_name).length;
  const totalUserScans = cards.reduce(
    (acc: number, c: any) => acc + (c.scan_count || 0),
    0,
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <User className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              كروت المستخدمين
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            متابعة وإدارة جميع الكروت التي أنشأها المستخدمون المسجلون في النظام
            بشكل مستقل.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchUserCards}
          leftIcon={
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          }
        >
          تحديث القائمة
        </Button>
      </div>

      {/* User Cards Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              إجمالي كروت المستخدمين
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {totalUserCards}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              الكروت المفعّلة
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
              {activeUserCards}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              الكروت غير المخصصة
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">
              {unassignedUserCards}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              إجمالي مسحات المستخدمين
            </p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1 font-mono">
              {totalUserScans}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Content Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
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

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">معرف الكارت</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">مالك الكارت (المستخدم)</th>
                <th className="py-3 px-4">العميل المخصص</th>
                <th className="py-3 px-4">رابط التقييم</th>
                <th className="py-3 px-4 text-center">المسحات</th>
                <th className="py-3 px-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-20 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-16 bg-slate-100 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-36 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-8 bg-slate-100 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="h-6 w-20 bg-slate-100 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredCards.length > 0 ? (
                filteredCards.map((card: any) => {
                  const status = getCardStatus(card);
                  return (
                    <tr
                      key={card.card_id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                        {card.card_id}
                      </td>
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
                      <td className="py-4 px-4 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px]">
                          <User className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[160px]">
                            {card.owner_email || card.user_id}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-800">
                        {card.client_name || "— لم يُعيّن —"}
                      </td>
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
                      <td className="py-4 px-4 text-center font-mono text-xs font-bold text-slate-900">
                        {card.scan_count || 0}
                      </td>
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
                            onClick={() => handleDeleteCard(card)}
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
                      لا توجد كروت للمستخدمين حتى الآن
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
