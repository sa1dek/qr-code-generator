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
  const { language, setLanguage, t, isRTL } = useLanguage();

  return (
    <header className="border-b border-[#2e2e2e] bg-[#212121] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Logo / Brand */}
        <div
          onClick={onGoToDashboard || (() => { window.location.href = "/"; })}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#f15827] text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-100 leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono">
              NFC & QR Review System
            </p>
          </div>
        </div>

        {/* Actions / User controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] bg-[#1e1e1e] hover:bg-[#2a2a2a] text-xs font-medium text-slate-300 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#f15827]" />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e1e1e] border border-[#333333] text-xs text-slate-300">
                {currentUser.role === "admin" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f15827]" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>{currentUser.username || currentUser.email}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="تسجيل الخروج"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-[#333333] transition-colors"
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
