import React from "react";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  BookOpen,
  LogOut,
  X,
  ExternalLink,
  Database,
  Radio,
  Sliders,
} from "lucide-react";
import { cn } from "../../lib/utils";

//--------------|| Types & Component Props Interface ||--------------//
export type AdminTab = "dashboard" | "cards" | "analytics" | "docs";

interface SidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  dbMode: "supabase" | "mock";
  onLogout: () => void;
}

//--------------|| Sidebar Component ||--------------//
export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  dbMode,
  onLogout,
}) => {
  //--------------|| Navigation Items Configuration ||--------------//
  const navItems = [
    {
      id: "dashboard" as AdminTab,
      label: "لوحة التحكم",
      icon: LayoutDashboard,
    },
    { id: "cards" as AdminTab, label: "إدارة الكروت", icon: CreditCard },
    {
      id: "analytics" as AdminTab,
      label: "سجل المسحات والتحليلات",
      icon: BarChart3,
    },
    { id: "docs" as AdminTab, label: "دليل NFC & QR", icon: BookOpen },
  ];

  //--------------|| Sidebar Inner Layout ||--------------//
  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4" dir="rtl">
      {/*--------------|| Brand Header & Mobile Close ||--------------*/}
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 leading-tight">
                ReviewCards
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">
                Dynamic NFC & QR
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/*--------------|| Navigation Menu Links ||--------------*/}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-right",
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-white" : "text-slate-500",
                  )}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/*--------------|| Database Status Badge & User Footer ||--------------*/}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        {/*--------------|| Database Mode Indicator ||--------------*/}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 text-[11px] font-medium">
              قاعدة البيانات:
            </span>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                dbMode === "supabase"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800",
              )}
            >
              {dbMode === "supabase" ? "Supabase Live" : "Mock DB Mode"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            {dbMode === "supabase"
              ? "متصل بقاعدة بيانات Supabase السحابية."
              : "وضع محاكاة سريع مع بيانات تجريبية جاهزة."}
          </p>
        </div>

        {/*--------------|| External Preview Link ||--------------*/}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>عرض الصفحة الرئيسية</span>
          </span>
          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
            Preview
          </span>
        </a>

        {/*--------------|| User Logout Action ||--------------*/}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-right"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/*--------------|| Desktop View Sidebar ||--------------*/}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 right-0 bg-white border-l border-slate-200/80 z-20">
        {sidebarContent}
      </aside>

      {/*--------------|| Mobile Drawer Overlay & Sidebar ||--------------*/}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
          />
          <aside className="relative mr-0 ml-auto w-72 max-w-[85vw] h-full bg-white shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
