import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "../../../types";
import { getAllProfiles } from "../services/adminService";

/**
 * Single source of truth for the admin users table.
 *
 * Deliberately holds no mutation logic: role changes and deletions go through
 * adminService and are followed by a refetch, so the rendered list is always the
 * database's answer rather than an optimistic guess. Per-row pending state and
 * toasts belong to the component that owns the interaction.
 */
export function useAdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const { users: rows, error } = await getAllProfiles();
      if (error) {
        setLoadError(error);
      } else {
        setUsers(rows);
        setLoadError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { users, isLoading, loadError, refetch };
}