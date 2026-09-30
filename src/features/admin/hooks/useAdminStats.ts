import { useState, useEffect, useCallback } from "react";
import type { DashboardStats } from "../../../types";
import { getAdminMetrics } from "../services/adminService";
import { useToast } from "../../../components/ui/Toast";

export function useAdminStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminMetrics();
      setStats(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب الإحصائيات");
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}
