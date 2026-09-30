import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:p-6 overflow-y-auto overscroll-contain"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-overlay-medium backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div
        className={cn(
          "relative w-full bg-surface-900 rounded-t-2xl sm:rounded-2xl shadow-lg border border-border-subtle p-4 sm:p-6 z-10 text-start overflow-hidden animate-in zoom-in-95 duration-200",
          "max-h-[92dvh] sm:max-h-[85dvh] overflow-y-auto",
          maxWidthClasses[maxWidth],
        )}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle mb-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            {description && (
              <p className="text-xs text-text-muted mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};