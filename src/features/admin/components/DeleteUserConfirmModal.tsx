import React, { useState } from "react";
import { Trash2, AlertTriangle, Shield, User, Mail, AtSign } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import type { UserProfile } from "../../../types";

interface DeleteUserConfirmModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  /** Resolves to `true` only when the deletion actually succeeded. */
  onConfirm: (userId: string) => Promise<boolean>;
}

export const DeleteUserConfirmModal: React.FC<DeleteUserConfirmModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === "admin";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Keep the dialog open when the RPC rejects, so the error toast is read
      // next to the account it refers to.
      const deleted = await onConfirm(user.id);
      if (deleted) onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      title="تأكيد حذف المستخدم"
      description="سيتم حذف الحساب نهائياً من النظام"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1 text-start" dir="rtl">
        {/* Warning banner */}
        <div className="flex items-center gap-3 p-3.5 bg-status-danger-bg border border-status-danger-border rounded-xl text-status-danger-text">
          <div className="w-10 h-10 rounded-lg bg-status-danger-border flex items-center justify-center shrink-0 text-status-danger-icon">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold block text-sm text-status-danger-icon">
              إجراء لا يمكن التراجع عنه
            </span>
            <span className="mt-0.5 block text-status-danger-text">
              سيُحذف حساب المستخدم من قاعدة البيانات نهائياً، ولن يتمكن من تسجيل
              الدخول مرة أخرى.
            </span>
          </div>
        </div>

        {/* Target user summary */}
        <div className="p-3 bg-surface-800/60 border border-border-subtle rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-text-muted shrink-0">
              <AtSign className="w-3.5 h-3.5" />
              اسم المستخدم
            </span>
            <span className="font-mono font-bold text-text-primary bg-surface-850 px-2 py-0.5 border border-border-subtle rounded">
              @{user.username || "بدون اسم"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-text-muted shrink-0">
              <Mail className="w-3.5 h-3.5" />
              البريد الإلكتروني
            </span>
            <span className="font-mono text-text-secondary truncate">
              {user.email}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-text-muted shrink-0">
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              الصلاحية الحالية
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isAdmin
                  ? "bg-brand/10 text-brand border-brand/25"
                  : "bg-surface-800 text-text-muted border-border-subtle"
              }`}
            >
              {isAdmin ? "مدير نظام (Admin)" : "مستخدم عادي (User)"}
            </span>
          </div>
        </div>

        {/* What exactly gets removed / kept */}
        <ul className="text-[11px] text-text-muted space-y-1.5 list-disc list-inside leading-relaxed">
          <li>
            يُحذف حساب الدخول <span className="text-text-secondary">auth.users</span>{" "}
            مع كل الجلسات والرموز المرتبطة به.
          </li>
          <li>
            يُحذف الملف الشخصي <span className="text-text-secondary">profiles</span>{" "}
            واسم المستخدم يصبح متاحاً لإعادة الاستخدام.
          </li>
          <li>
            الكروت المرتبطة{" "}
            <span className="text-text-secondary">لا تُحذف</span>، بل تعود غير
            مُسندة إلى لوحة الأدمن مع إيقاف توجيهها، ويبقى سجل مسحاتها كما هو.
          </li>
        </ul>

        {/* Actions */}
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
            نعم، احذف المستخدم
          </Button>
        </div>
      </div>
    </Modal>
  );
};