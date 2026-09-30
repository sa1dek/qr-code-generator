import type { DashboardStats, UserProfile } from "../../../types";

export interface AdminStatsState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface AdminUsersState {
  users: UserProfile[];
  isLoading: boolean;
  error: string | null;
}

export interface AdminCardFilters {
  status: "all" | "active" | "inactive" | "unassigned";
  search: string;
}
