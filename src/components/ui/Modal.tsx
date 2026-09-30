import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/utils";

//--------------|| Component Props Interface ||--------------//
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

//--------------|| Modal Component ||--------------//
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  //--------------|| Keyboard Listeners & Body Scroll Lock ||--------------//
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  //--------------|| Max Width Utility Classes ||--------------//
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/*--------------|| Backdrop Overlay ||--------------*/}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/*--------------|| Dialog Content Container ||--------------*/}
      <div
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 z-10 text-right overflow-hidden transition-all animate-in zoom-in-95 duration-200",
          maxWidthClasses[maxWidth],
        )}
      >
        {/*--------------|| Modal Header & Close Action ||--------------*/}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
          <button
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {description && (
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            )}
          </div>
        </div>

        {/*--------------|| Modal Body Content ||--------------*/}
        <div>{children}</div>
      </div>
    </div>
  );
};
