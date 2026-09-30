import { useState, useEffect, useCallback } from "react";
import type { DashboardStats } from "../../../types";
import { getAdminDashboardStats } from "../services/adminService";
import { useToast } from "../../../components/ui/Toast";

export function useAdminStats(adminId?: string | null) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminDashboardStats(adminId);
      setStats(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب الإحصائيات");
    } finally {
      setIsLoading(false);
    }
  }, [adminId, toastError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}
