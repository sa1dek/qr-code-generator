import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, getCardStatus, CardStatus as StatusType } from "../../../types/card";

interface CardStatusBadgeProps {
  card: Pick<Card, "is_active" | "target_url">;
  size?: "sm" | "md";
}

export const CardStatusBadge: React.FC<CardStatusBadgeProps> = ({
  card,
  size = "md",
}) => {
  const status: StatusType = getCardStatus(card);

  if (status === "active") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
        }`}
      >
        <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        مفعل وموجه
      </span>
    );
  }

  if (status === "unassigned") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
        }`}
      >
        <AlertTriangle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        غير مبرمج
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <XCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      معطل مؤقتاً
    </span>
  );
};
