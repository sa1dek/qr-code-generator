import React from "react";
import { CreditCard, CheckCircle2, AlertTriangle, QrCode } from "lucide-react";
import type { DashboardStats as StatsType } from "../../types/card";

//--------------|| Component Props Interface ||--------------//
interface DashboardStatsProps {
  stats: StatsType | null;
  isLoading: boolean;
}

//--------------|| Dashboard Stats Component ||--------------//
export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading,
}) => {
  //--------------|| Statistics Configuration ||--------------//
  const items = [
    {
      id: "stat-total-cards",
      label: "إجمالي الكروت",
      sublabel: "Total Cards",
      value: stats?.totalCards ?? 0,
      icon: CreditCard,
      color: "text-slate-900",
      bgColor: "bg-slate-100",
    },
    {
      id: "stat-active-cards",
      label: "الكروت المفعلة",
      sublabel: "Active Cards",
      value: stats?.activeCards ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
    },
    {
      id: "stat-unassigned-cards",
      label: "الكروت غير المخصصة",
      sublabel: "Unassigned",
      value: stats?.unassignedCards ?? 0,
      icon: AlertTriangle,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
    },
    {
      id: "stat-total-scans",
      label: "إجمالي عمليات المسح",
      sublabel: "Total Scans",
      value: stats?.totalScans ?? 0,
      icon: QrCode,
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
      {items.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            id={item.id}
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors"
          >
            {/*--------------|| Stat Header & Icon ||--------------*/}
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-slate-500">
                {item.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${item.bgColor} flex items-center justify-center shrink-0`}
              >
                <IconComponent className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>

            {/*--------------|| Stat Value & Sublabel ||--------------*/}
            <div className="flex items-baseline justify-between gap-2">
              {isLoading ? (
                <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                  {item.value.toLocaleString()}
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                {item.sublabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
