import React, { useState } from "react";
import { Shield, User, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../auth/hooks/useAuth";
import { useAdminUsers } from "../hooks/useAdminUsers";
import {
  updateUserRole,
  deleteUserCompletely,
} from "../services/adminService";
import { DeleteUserConfirmModal } from "./DeleteUserConfirmModal";
import type { UserProfile, UserRole } from "../../../types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "user", label: "مستخدم عادي (User)" },
  { value: "admin", label: "مدير نظام (Admin)" },
];

export const UsersManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, isLoading, loadError, refetch } = useAdminUsers();
  const { success, error: toastError } = useToast();

  // Row currently being saved / deleted, so the rest of the table stays usable.
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const adminCount = users.filter((u) => u.role === "admin").length;

  const handleRoleChange = async (
    userId: string,
    nextRole: UserRole,
    currentRole: UserRole,
  ) => {
    if (nextRole === currentRole) return;

    setPendingRoleId(userId);
    try {
      const result = await updateUserRole(userId, nextRole);
      if (result.success) {
        success(
          nextRole === "admin"
            ? "تمت ترقية المستخدم إلى مدير نظام بنجاح"
            : "تم إرجاع المستخدم إلى صلاحيات مستخدم عادي",
        );
        // Re-read from the database rather than trusting the local mutation.
        await refetch();
      } else {
        toastError(result.error || "فشل تحديث الصلاحية");
      }
    } finally {
      setPendingRoleId(null);
    }
  };

  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    const result = await deleteUserCompletely(userId);
    if (!result.success) {
      toastError(result.error || "فشل في حذف المستخدم");
      return false;
    }

    success("تم حذف المستخدم وكافة بياناته بنجاح");
    await refetch();
    return true;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="surface-elevated p-4 sm:p-6 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text-primary">
            إدارة المستخدمين والصلاحيات
          </h1>
          <p className="text-xs text-text-muted mt-1">
            تحكم كامل في الحسابات المسجلة: رقِّ أو ارجع أي حساب إلى دوره، واحذف
            الحساب مع كل بياناته.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
          className="w-full sm:w-auto shrink-0"
          leftIcon={
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          }
        >
          تحديث القائمة
        </Button>
      </div>

      {/* Load failure */}
      {loadError && !isLoading && (
        <div className="flex items-center gap-3 p-3.5 bg-status-danger-bg border border-status-danger-border rounded-xl text-status-danger-text">
          <AlertCircle className="w-4 h-4 shrink-0 text-status-danger-icon" />
          <span className="text-xs font-medium">{loadError}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            className="mr-auto shrink-0"
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Users Table (desktop) */}
      <div className="hidden md:block bg-surface-850 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-surface-800/60 border-b border-border-subtle text-text-muted text-[11px] font-bold uppercase">
                <th className="py-3 px-4">اسم المستخدم (Username)</th>
                <th className="py-3 px-4">البريد الإلكتروني</th>
                <th className="py-3 px-4">الصلاحية الحالية</th>
                <th className="py-3 px-4 w-[190px]">تغيير الصلاحية</th>
                <th className="py-3 px-4 text-left w-[130px]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-surface-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-40 bg-surface-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-20 bg-surface-800 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-9 w-40 bg-surface-800 rounded-xl" />
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="h-8 w-24 bg-surface-800 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isSelf = u.id === currentUser?.id;
                  const isRolePending = pendingRoleId === u.id;
                  // Mirrors the guards inside admin_set_role() so the UI explains
                  // itself instead of bouncing an error off the database.
                  const isLastAdmin = isAdmin && adminCount <= 1;
                  const roleLocked =
                    isRolePending || isSelf || (isLastAdmin && isAdmin);
                  const roleLockedReason = isRolePending
                    ? undefined
                    : isSelf
                      ? "لا يمكنك تغيير صلاحيتك الخاصة"
                      : isLastAdmin && isAdmin
                        ? "لا يمكن إرجاع آخر مدير نظام"
                        : undefined;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-surface-800/40 transition-colors duration-150"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-text-primary text-xs">
                        @{u.username || "بدون اسم"}
                        {isSelf && (
                          <span className="block mt-1 text-[10px] font-sans font-medium text-brand">
                            حسابك الحالي
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-text-muted">
                        {u.email}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isAdmin
                              ? "bg-brand/10 text-brand border-brand/25"
                              : "bg-surface-800 text-text-muted border-border-subtle"
                          }`}
                        >
                          {isAdmin ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {isAdmin ? "مدير نظام (Admin)" : "مستخدم عادي (User)"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Select
                          aria-label={`تغيير صلاحية ${u.username || u.email}`}
                          className="min-w-[170px] py-2 text-xs"
                          value={u.role}
                          disabled={roleLocked}
                          helperText={roleLockedReason}
                          options={ROLE_OPTIONS}
                          onChange={(e) =>
                            handleRoleChange(
                              u.id,
                              e.target.value as UserRole,
                              u.role,
                            )
                          }
                        />
                      </td>
                      <td className="py-4 px-4 text-left">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setUserToDelete(u)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "لا يمكنك حذف حسابك الخاص"
                              : `حذف ${u.username || u.email}`
                          }
                          leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                          حذف
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-text-muted text-xs"
                  >
                    لا توجد حسابات مسجلة حتى الآن
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users list (mobile) */}
      <div className="md:hidden bg-surface-850 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`m-skel-${i}`} className="p-4 space-y-3 animate-pulse">
              <div className="h-4 w-28 bg-surface-800 rounded" />
              <div className="h-3 w-40 bg-surface-800 rounded" />
              <div className="h-9 w-full bg-surface-800 rounded-xl" />
            </div>
          ))
        ) : users.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {users.map((u) => {
              const isAdmin = u.role === "admin";
              const isSelf = u.id === currentUser?.id;
              const isRolePending = pendingRoleId === u.id;
              const isLastAdmin = isAdmin && adminCount <= 1;
              const roleLocked =
                isRolePending || isSelf || (isLastAdmin && isAdmin);
              const roleLockedReason = isRolePending
                ? undefined
                : isSelf
                  ? "لا يمكنك تغيير صلاحيتك الخاصة"
                  : isLastAdmin && isAdmin
                    ? "لا يمكن إرجاع آخر مدير نظام"
                    : undefined;

              return (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-text-primary text-sm truncate">
                        @{u.username || "بدون اسم"}
                      </p>
                      {isSelf && (
                        <p className="mt-1 text-[10px] font-medium text-brand">
                          حسابك الحالي
                        </p>
                      )}
                      <p className="mt-1 text-[11px] font-mono text-text-muted truncate">
                        {u.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isAdmin
                          ? "bg-brand/10 text-brand border-brand/25"
                          : "bg-surface-800 text-text-muted border-border-subtle"
                      }`}
                    >
                      {isAdmin ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {isAdmin ? "Admin" : "User"}
                    </span>
                  </div>

                  <Select
                    aria-label={`تغيير صلاحية ${u.username || u.email}`}
                    className="w-full text-xs"
                    value={u.role}
                    disabled={roleLocked}
                    helperText={roleLockedReason}
                    options={ROLE_OPTIONS}
                    onChange={(e) =>
                      handleRoleChange(u.id, e.target.value as UserRole, u.role)
                    }
                  />

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setUserToDelete(u)}
                    disabled={isSelf}
                    className="w-full"
                    title={
                      isSelf
                        ? "لا يمكنك حذف حسابك الخاص"
                        : `حذف ${u.username || u.email}`
                    }
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    حذف الحساب
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-12 text-center text-text-muted text-xs">
            لا توجد حسابات مسجلة حتى الآن
          </p>
        )}
      </div>

      <DeleteUserConfirmModal
        user={userToDelete}
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};