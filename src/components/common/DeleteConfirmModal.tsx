import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import type { Card } from "../../types/card";

//--------------|| Component Props Interface ||--------------//
interface DeleteConfirmModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cardId: string) => Promise<void> | void;
}

//--------------|| Delete Confirmation Modal Component ||--------------//
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  card,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!card) return null;

  //--------------|| Delete Handler ||--------------//
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(card.card_id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      title="تأكيد حذف الكارت"
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1 text-right" dir="rtl">
        {/*--------------|| Warning Banner ||--------------*/}
        <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-900">
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-rose-950 block text-sm">
              إجراء لا يمكن التراجع عنه
            </span>
            <span className="text-rose-700 mt-0.5 block">
              سيتم حذف الكارت وإلغاء توجيهه وإزالة سجل المسحات المرتبط به.
            </span>
          </div>
        </div>

        {/*--------------|| Card Summary Details ||--------------*/}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">معرف الكارت:</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 border border-slate-200 rounded">
              {card.card_id}
            </span>
          </div>

          {card.client_name && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">العميل المخصص:</span>
              <span className="font-medium text-slate-800">
                {card.client_name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-500">إجمالي المسحات:</span>
            <span className="font-mono text-slate-800">
              {card.scan_count || 0} مسحة
            </span>
          </div>
        </div>

        {/*--------------|| Modal Actions ||--------------*/}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-600"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            نعم، احذف الكارت
          </Button>
        </div>
      </div>
    </Modal>
  );
};
