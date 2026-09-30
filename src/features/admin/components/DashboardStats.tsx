import React from "react";
import { CreditCard, CheckCircle2, AlertTriangle, QrCode } from "lucide-react";
import type { DashboardStats as StatsType } from "../../../types/card";

interface DashboardStatsProps {
  stats: StatsType | null;
  isLoading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading,
}) => {
  const items = [
    {
      id: "stat-total-cards",
      label: "إجمالي الكروت",
      sublabel: "Total Cards",
      value: stats?.totalCards ?? 0,
      icon: CreditCard,
      color: "text-brand",
      bgColor: "bg-brand/10",
      borderColor: "border-brand/20",
    },
    {
      id: "stat-active-cards",
      label: "الكروت المفعلة",
      sublabel: "Active Cards",
      value: stats?.activeCards ?? 0,
      icon: CheckCircle2,
      color: "text-status-active-icon",
      bgColor: "bg-status-active-bg",
      borderColor: "border-status-active-border",
    },
    {
      id: "stat-unassigned-cards",
      label: "الكروت غير المخصصة",
      sublabel: "Unassigned",
      value: stats?.unassignedCards ?? 0,
      icon: AlertTriangle,
      color: "text-status-unassigned-icon",
      bgColor: "bg-status-unassigned-bg",
      borderColor: "border-status-unassigned-border",
    },
    {
      id: "stat-total-scans",
      label: "إجمالي عمليات المسح",
      sublabel: "Total Scans",
      value: stats?.totalScans ?? 0,
      icon: QrCode,
      color: "text-status-info-icon",
      bgColor: "bg-status-info-bg",
      borderColor: "border-status-info-border",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" dir="rtl">
      {items.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            id={item.id}
            key={item.id}
            className="surface rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-border-secondary transition-colors min-w-0"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-text-muted truncate">
                {item.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${item.bgColor} ${item.borderColor} flex items-center justify-center shrink-0`}
              >
                <IconComponent className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              {isLoading ? (
                <div className="h-8 w-20 bg-surface-800 rounded-lg animate-pulse" />
              ) : (
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-text-primary font-mono truncate">
                  {item.value.toLocaleString()}
                </span>
              )}
              <span className="text-[11px] text-text-muted font-medium hidden sm:inline">
                {item.sublabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};