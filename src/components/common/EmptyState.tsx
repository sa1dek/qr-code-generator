import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "../../utils/utils";
import { Button } from "../ui/Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border-muted bg-surface-850/40",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-800 border border-border-subtle flex items-center justify-center text-text-muted mb-4">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-text-muted max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
