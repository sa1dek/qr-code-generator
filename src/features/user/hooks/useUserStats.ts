import { useState, useEffect, useCallback } from "react";
import type { DashboardStats } from "../../../types/card";
import { getDashboardStats } from "../../../features/cards/services/cardService";
import { useAuth } from "../../auth/hooks/useAuth";
import { useToast } from "../../../components/ui/Toast";

export function useUserStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getDashboardStats({ id: user.id, role: "user" });
      setStats(data);
    } catch (err: any) {
      toastError(err?.message || "فشل في جلب الإحصائيات");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toastError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}