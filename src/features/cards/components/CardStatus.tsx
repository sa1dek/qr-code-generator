import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import {
  Card,
  getCardStatus,
  CardStatus as StatusType,
} from "../../../types/card";

interface CardStatusBadgeProps {
  card: Pick<Card, "is_active" | "target_url">;
  size?: "sm" | "md";
}

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

const ICON_CLASSES = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
};

const STATUS_STYLES: Record<StatusType, string> = {
  active: "bg-status-active-bg text-status-active-text border-status-active-border",
  unassigned:
    "bg-status-unassigned-bg text-status-unassigned-text border-status-unassigned-border",
  inactive:
    "bg-status-inactive-bg text-status-inactive-text border-status-inactive-border",
};

const STATUS_CONTENT: Record<
  StatusType,
  { label: string; Icon: typeof CheckCircle2 }
> = {
  active: { label: "مُفعّل", Icon: CheckCircle2 },
  unassigned: { label: "غير مخصص", Icon: AlertTriangle },
  inactive: { label: "معطل", Icon: XCircle },
};

export const CardStatusBadge: React.FC<CardStatusBadgeProps> = ({
  card,
  size = "md",
}) => {
  const status: StatusType = getCardStatus(card);
  const { label, Icon } = STATUS_CONTENT[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold whitespace-nowrap shrink-0 ${SIZE_CLASSES[size]} ${STATUS_STYLES[status]}`}
    >
      <Icon className={`${ICON_CLASSES[size]} shrink-0`} />
      {label}
    </span>
  );
};
