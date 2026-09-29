import React from "react";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BarChart3,
  BookOpen,
  LogOut,
  X,
  ExternalLink,
  Radio,
  ShieldCheck,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { AuthUser } from "../../types/card";

export type AdminTab =
  | "dashboard"
  | "cards"
  | "user-cards"
  | "users-management"
  | "analytics"
  | "docs";

interface SidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  dbMode: "supabase" | "mock";
  onLogout: () => void;
  currentUser?: AuthUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  dbMode,
  onLogout,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === "admin";

  // القائمة الجانبية: تظهر كروت المستخدمين للأدمن فقط وتختفي عن اليوزر العادي
  const navItems = [
    {
      id: "dashboard" as AdminTab,
      label: "لوحة التحكم",
      icon: LayoutDashboard,
    },
    { id: "cards" as AdminTab, label: "إدارة الكروت", icon: CreditCard },

    // تظهر للأدمن فقط
    ...(isAdmin
      ? [
          {
            id: "user-cards" as AdminTab,
            label: "كروت المستخدمين",
            icon: Users,
          },
          {
            id: "users-management" as AdminTab,
            label: "إدارة المستخدمين",
            icon: Shield,
          },
        ]
      : []),
    {
      id: "analytics" as AdminTab,
      label: "سجل المسحات والتحليلات",
      icon: BarChart3,
    },
    { id: "docs" as AdminTab, label: "دليل NFC & QR", icon: BookOpen },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4" dir="rtl">
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

      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        {/* بطاقة تعريف نوع الحساب الحالي (أدمن أو مستخدم عادي) */}
        {/* بطاقة تعريف نوع الحساب الحالي */}
        <div
          className={cn(
            "border rounded-xl p-3 text-xs transition-all shadow-2xs",
            isAdmin
              ? "bg-indigo-50/90 border-indigo-200 text-indigo-900"
              : "bg-slate-100 border-slate-300 text-slate-800",
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold opacity-75">
              نوع الحساب:
            </span>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-2xs",
                isAdmin
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-white",
              )}
            >
              {isAdmin ? (
                <ShieldCheck className="w-3 h-3" />
              ) : (
                <UserIcon className="w-3 h-3" />
              )}
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>
          <p
            className="text-[11px] font-bold truncate font-mono mt-1"
            title={currentUser?.email}
          >
            {currentUser?.email || "مستخدم مسجل"}
          </p>
        </div>

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
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 right-0 bg-white border-l border-slate-200/80 z-20">
        {sidebarContent}
      </aside>

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
