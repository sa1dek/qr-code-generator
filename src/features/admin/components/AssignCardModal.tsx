import React, { useState, useEffect } from "react";
import { Trash2, Link as LinkIcon } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { Card } from "../../../types/card";
import { useToast } from "../../../components/ui/Toast";
import { updateCard } from "../../cards/services/cardService";

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
      const res = await updateCard(card.card_id, {
        client_name: clientName,
        target_url: targetUrl,
        is_active: isActive,
      });

      if (res.success && res.card) {
        success("تم حفظ تغييرات الكارت بنجاح");
        onSuccess(res.card);
        onClose();
      } else {
        error(res.error || "تعذر حفظ البيانات");
      }
    } catch {
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
        className="space-y-4 pt-1 text-start"
        dir="rtl"
      >
        <p className="text-xs text-text-muted">
          اربط هذا الكارت بجمهور أو عميل محدد وضبط رابط التوجيه النهائي
          للتقييمات.
        </p>

        {/*--------------|| Readonly Card ID Display ||--------------*/}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            معرف الكارت (Card ID)
          </label>
          <Input
            value={card.card_id}
            disabled
            className="font-mono text-text-disabled"
          />
        </div>

        {/*--------------|| Client / Business Name Input ||--------------*/}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            اسم العميل أو النشاط التجاري
          </label>
          <Input
            placeholder="مثال: مطعم النخبة"
            value={clientName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)}
            required
          />
        </div>

        {/*--------------|| Redirect Target URL Input ||--------------*/}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            رابط التوجيه / تقييم جوجل (Target URL)
          </label>
          <Input
            type="url"
            placeholder="https://g.page/r/..."
            value={targetUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetUrl(e.target.value)}
            leftIcon={<LinkIcon className="w-4 h-4" />}
            required
          />
        </div>

        {/*--------------|| Card Status Toggle Switch ||--------------*/}
        <div className="flex items-center justify-between gap-3 p-3 bg-surface-800/60 border border-border-subtle rounded-xl">
          <div className="min-w-0">
            <span className="text-xs font-bold text-text-primary block">
              حالة تفعيل الكارت
            </span>
            <span className="text-[11px] text-text-muted">
              عند مسح الكارت، سيتم توجيه العميل فوراً إلى الرابط عند التفعيل.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <div className="w-11 h-6 bg-surface-750 border border-border-subtle peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-text-inverse after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-primary after:border-surface-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-status-active-bg peer-checked:border-status-active-border" />
          </label>
        </div>

        {/*--------------|| Modal Actions Footer ||--------------*/}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border-subtle">
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              onClose();
              onDeleteCard(card);
            }}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            حذف الكارت
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
