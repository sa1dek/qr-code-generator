import React from "react";
import { QrCode, BarChart3, UserPlus, Smartphone, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LiveDemoSimulator } from "../features/landing/components/LiveDemoSimulator";

//--------------|| Component Props Interface ||--------------//
interface HomePageProps {
  onGoToLogin: () => void;
  onGoToSignUp: () => void;
  onGoToDashboard: () => void;
  isAuthenticated: boolean;
}

//--------------|| Home Page Component ||--------------//
export const HomePage: React.FC<HomePageProps> = ({
  onGoToLogin,
  onGoToSignUp,
  onGoToDashboard,
  isAuthenticated,
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();

  return (
    <div
      className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-brand-muted selection:text-text-primary overflow-x-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/*--------------|| Navbar Header ||--------------*/}
      <header className="border-b border-border-subtle bg-surface-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand text-text-inverse flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base text-text-primary tracking-wide block leading-tight truncate">
                {t("heroTitle")}
              </span>
              <span className="text-[11px] text-text-muted block truncate">
                {t("subtitle")}
              </span>
            </div>
          </div>

          {/*--------------|| Header Controls ||--------------*/}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-850 text-xs font-bold text-text-primary hover:border-brand/50 hover:bg-surface-800 transition-all duration-150 ease-out-expo"
            >
              <Globe className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>{language === "ar" ? "EN" : "AR"}</span>
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={onGoToDashboard}
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-text-inverse px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors duration-150 whitespace-nowrap"
              >
                <span>{t("dashboard")}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToLogin}
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-text-inverse px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors duration-150 whitespace-nowrap"
              >
                <span>{t("login")}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/*--------------|| Main Content ||--------------*/}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16">
        {/*--------------|| Hero + Simulator ||--------------*/}
        {/* The direction follows the active language, so the hero (first in
            source) takes the leading column on desktop; both stack hero-first
            on mobile and tablet. */}
        <div className="grid lg:grid-cols-2 lg:items-center gap-8">
          {/*--------------|| Hero Section ||--------------*/}
          <div className="text-center lg:text-start space-y-4 lg:space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight leading-tight text-balance">
              {t("heroTitle")}
            </h1>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t("heroDesc")}
            </p>

            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={isAuthenticated ? onGoToDashboard : onGoToLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-text-inverse px-7 py-3 rounded-xl font-bold text-sm transition-colors duration-150"
              >
                <span>{t("goToDashboard")}</span>
              </button>

              <button
                type="button"
                onClick={onGoToSignUp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-850 hover:bg-surface-800 text-text-primary border border-border-subtle px-5 py-3 rounded-xl font-medium text-sm transition-colors duration-150"
              >
                <UserPlus className="w-4 h-4 text-brand" />
                <span>{t("createAccount")}</span>
              </button>
            </div>
          </div>

          {/*--------------|| Live Demo Simulator ||--------------*/}
          <LiveDemoSimulator
            onStart={isAuthenticated ? onGoToDashboard : onGoToSignUp}
          />
        </div>

        {/*--------------|| Features Grid ||--------------*/}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Smartphone,
              title: t("nfcSupportTitle"),
              desc: t("nfcSupportDesc"),
            },
            { icon: QrCode, title: t("qrGenTitle"), desc: t("qrGenDesc") },
            {
              icon: BarChart3,
              title: t("analyticsTitle"),
              desc: t("analyticsDesc"),
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="surface rounded-2xl p-4 sm:p-5 space-y-2.5 transition-colors duration-200 hover:border-brand/30"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
