import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "../../../types";
import { getAllProfiles, updateUserRole } from "../services/adminService";
import { useToast } from "../../../components/ui/Toast";

export function useAdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllProfiles();
      setUsers(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب المستخدمين");
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleRole = async (userId: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      success("تم تحديث صلاحية المستخدم بنجاح");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } else {
      toastError(res.error || "فشل في تحديث الصلاحية");
    }
  };

  return { users, isLoading, refetch: fetchUsers, toggleRole };
}
