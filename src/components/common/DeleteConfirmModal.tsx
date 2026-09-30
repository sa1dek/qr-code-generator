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
      <div className="space-y-4 pt-1 text-start" dir="rtl">
        {/*--------------|| Warning Banner ||--------------*/}
        <div className="flex items-center gap-3 p-3.5 bg-status-danger-bg border border-status-danger-border rounded-xl text-status-danger-text">
          <div className="w-10 h-10 rounded-lg bg-status-danger-border flex items-center justify-center shrink-0 text-status-danger-icon">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold block text-sm text-status-danger-icon">
              إجراء لا يمكن التراجع عنه
            </span>
            <span className="mt-0.5 block text-status-danger-text">
              سيتم حذف الكارت وإلغاء توجيهه وإزالة سجل المسحات المرتبط به.
            </span>
          </div>
        </div>

        {/*--------------|| Card Summary Details ||--------------*/}
        <div className="p-3 bg-surface-800/60 border border-border-subtle rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">معرف الكارت:</span>
            <span className="font-mono font-bold text-text-primary bg-surface-850 px-2 py-0.5 border border-border-subtle rounded">
              {card.card_id}
            </span>
          </div>

          {card.client_name && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted">العميل المخصص:</span>
              <span className="font-medium text-text-secondary">
                {card.client_name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-text-muted">إجمالي المسحات:</span>
            <span className="font-mono text-text-secondary">
              {card.scan_count || 0} مسحة
            </span>
          </div>
        </div>

        {/*--------------|| Modal Actions ||--------------*/}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            نعم، احذف الكارت
          </Button>
        </div>
      </div>
    </Modal>
  );
};
