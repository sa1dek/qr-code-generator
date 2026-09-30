import { useState, useEffect, useCallback } from "react";
import type { UserProfile, UserUpdateData } from "../../../types/user";
import { getUserProfile } from "../../auth/services/authService";
import { updateUserProfile } from "../services/userService";
import { useAuth } from "../../auth/hooks/useAuth";
import { useToast } from "../../../components/ui/Toast";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getUserProfile(user.id);
      setProfile(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب الملف الشخصي");
    } finally {
      setIsLoading(false);
    }
  }, [user, toastError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data: UserUpdateData) => {
    if (!user?.id) return false;
    setIsLoading(true);
    try {
      const res = await updateUserProfile(user.id, data);
      if (res.success && res.profile) {
        setProfile(res.profile);
        success("تم تحديث الملف الشخصي بنجاح");
        return true;
      } else {
        toastError(res.error || "فشل تحديث البيانات");
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, isLoading, fetchProfile, updateProfile };
}
