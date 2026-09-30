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
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#333333] bg-[#1e1e1e]/40",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-4 border border-slate-700/50">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1.5 leading-relaxed">
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
