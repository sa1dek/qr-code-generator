import React, { useState, useEffect } from "react";
import { Trash2, Link as LinkIcon } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { Card } from "../../types/card";
import { useToast } from "../ui/Toast";
import { updateCardApi } from "../../lib/fetchUtils";

//--------------|| Component Props Interface ||--------------//
interface AssignCardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCard: Card) => void;
  onDeleteCard: (card: Card) => void;
}

//--------------|| Assign Card Modal Component ||--------------//
export const AssignCardModal: React.FC<AssignCardModalProps> = ({
  card,
  isOpen,
  onClose,
  onSuccess,
  onDeleteCard,
}) => {
  const [clientName, setClientName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  //--------------|| Sync Card State On Open ||--------------//
  useEffect(() => {
    if (card) {
      setClientName(card.client_name || "");
      setTargetUrl(card.target_url || "");
      setIsActive(card.is_active ?? true);
    }
  }, [card]);

  if (!card) return null;

  //--------------|| Form Save Handler ||--------------//
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await updateCardApi(card.card_id, {
        client_name: clientName,
        target_url: targetUrl,
        is_active: isActive,
      });

      if (res.ok && res.data.success && res.data.card) {
        success("تم حفظ تغييرات الكارت بنجاح");
        onSuccess(res.data.card);
        onClose();
      } else {
        error(res.data?.error || "تعذر حفظ البيانات");
      }
    } catch (err: any) {
      error("حدث خطأ أثناء الاتصال بقاعدة البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={`تخصيص الكارت: ${card.card_id}`}
      maxWidth="md"
    >
      <form
        onSubmit={handleSave}
        className="space-y-4 pt-1 text-right"
        dir="rtl"
      >
        <p className="text-xs text-slate-500">
          اربط هذا الكارت بجمهور أو عميل محدد وضبط رابط التوجيه النهائي
          للتقييمات.
        </p>

        {/*--------------|| Static Card ID (Disabled) ||--------------*/}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            المعرف الثابت للكارت
          </label>
          <Input
            value={card.card_id}
            disabled
            className="bg-slate-100 font-mono text-slate-600"
          />
        </div>

        {/*--------------|| Client / Business Name Input ||--------------*/}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            اسم العميل أو النشاط التجاري
          </label>
          <Input
            placeholder="مثال: مطعم النخبة"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>

        {/*--------------|| Redirect Target URL Input ||--------------*/}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            رابط التوجيه / تقييم جوجل (Target URL)
          </label>
          <Input
            type="url"
            placeholder="https://g.page/r/..."
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            leftElement={<LinkIcon className="w-4 h-4" />}
            required
          />
        </div>

        {/*--------------|| Card Status Toggle Switch ||--------------*/}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              حالة تفعيل الكارت
            </span>
            <span className="text-[11px] text-slate-500">
              عند مسح الكارت، سيتم توجيه العميل فوراً إلى الرابط عند التفعيل.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-0" : "-translate-x-5"
              }`}
            />
          </button>
        </div>

        {/*--------------|| Modal Actions & Deletion ||--------------*/}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onDeleteCard(card)}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" />
            حذف الكارت
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
