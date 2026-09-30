import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../utils/utils";

//--------------|| Toast Data Types ||--------------//
export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

//--------------|| Context Interface ||--------------//
interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

//--------------|| Context Creation ||--------------//
const ToastContext = createContext<ToastContextType | undefined>(undefined);

//--------------|| Toast Provider Component ||--------------//
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  //--------------|| Toast Removal Handler ||--------------//
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  //--------------|| Toast Dispatcher ||--------------//
  const toast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  //--------------|| Helper Trigger Functions ||--------------//
  const success = useCallback(
    (message: string) => toast(message, "success"),
    [toast],
  );
  const error = useCallback(
    (message: string) => toast(message, "error"),
    [toast],
  );
  const info = useCallback(
    (message: string) => toast(message, "info"),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/*--------------|| Floating Toast Notifications Overlay ||--------------*/}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm transition-all duration-200 animate-in slide-in-from-bottom-2",
              t.type === "success" &&
                "bg-emerald-950 text-emerald-100 border-emerald-800",
              t.type === "error" && "bg-rose-950 text-rose-100 border-rose-800",
              t.type === "info" &&
                "bg-slate-900 text-slate-100 border-slate-800",
            )}
            dir="rtl"
          >
            <div className="flex items-center gap-2.5">
              {t.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {t.type === "info" && (
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="font-medium text-xs sm:text-sm">
                {t.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              aria-label="إغلاق الإشعار"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

//--------------|| Custom Hook ||--------------//
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
