import React from "react";
import { Radio, Globe, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../ui/Button";
import type { AuthUser } from "../../types/card";

interface NavbarProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onGoToLogin?: () => void;
  onGoToDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onGoToLogin,
  onGoToDashboard,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b border-border-subtle bg-surface-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onGoToDashboard || (() => { window.location.href = "/"; })}
          className="flex items-center gap-3 text-start cursor-pointer select-none min-w-0"
        >
          <div className="w-9 h-9 shrink-0 rounded-xl bg-brand text-text-inverse flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base text-text-primary leading-tight truncate">
              {t("heroTitle")}
            </h1>
            <p className="text-[10px] sm:text-xs text-text-muted font-mono truncate">
              NFC & QR Review System
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-850 hover:bg-surface-800 hover:border-brand/40 text-xs font-medium text-text-secondary transition-all duration-200 ease-out-expo active:scale-95 whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-brand" />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-850 border border-border-subtle text-xs text-text-secondary max-w-[220px]">
                {currentUser.role === "admin" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-status-info-icon shrink-0" />
                )}
                <span className="truncate">
                  {currentUser.username || currentUser.email}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="تسجيل الخروج"
                  className="p-1.5 rounded-lg text-text-muted hover:text-status-danger-text hover:bg-status-danger-bg border border-border-subtle transition-all duration-200 ease-out-expo active:scale-90"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            onGoToLogin && (
              <Button size="sm" onClick={onGoToLogin}>
                تسجيل الدخول
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
};