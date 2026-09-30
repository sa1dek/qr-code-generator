import React from "react";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BarChart3,
  BookOpen,
  LogOut,
  X,
  Radio,
  ShieldCheck,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { cn } from "../../utils/utils";
import { useLanguage } from "../../context/LanguageContext";
import type { AuthUser } from "../../types/card";

export type AdminTab =
  | "dashboard"
  | "cards"
  | "user-cards"
  | "users-management"
  | "analytics"
  | "docs";

export type UserTab = "dashboard" | "my-cards" | "docs";

export type Tab = AdminTab | UserTab;

interface SidebarProps<T extends Tab = Tab> {
  currentTab: T;
  onSelectTab: (tab: T) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  dbMode: "supabase" | "mock";
  onLogout: () => void;
  currentUser?: AuthUser | null;
  role?: "admin" | "user";
}

function SidebarInner<T extends Tab>({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  currentUser,
  role = "user",
}: SidebarProps<T>) {
  const { isRTL } = useLanguage();
  const isAdmin = role === "admin" || currentUser?.role === "admin";

  React.useEffect(() => {
    if (!isOpenMobile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpenMobile, onCloseMobile]);

  const navItems: { id: T; label: string; icon: React.FC<any> }[] = isAdmin
    ? ([
        { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
        { id: "cards", label: "إدارة الكروت", icon: CreditCard },
        { id: "user-cards", label: "كروت المستخدمين", icon: Users },
        { id: "users-management", label: "إدارة المستخدمين", icon: Shield },
        {
          id: "analytics",
          label: "سجل المسحات والتحليلات",
          icon: BarChart3,
        },
        { id: "docs", label: "دليل NFC & QR", icon: BookOpen },
      ] as unknown as { id: T; label: string; icon: React.FC<any> }[])
    : ([
        { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
        { id: "my-cards", label: "كروتي", icon: CreditCard },
        { id: "docs", label: "دليل NFC & QR", icon: BookOpen },
      ] as unknown as { id: T; label: string; icon: React.FC<any> }[]);

  const sidebarContent = (
    <div
      className="flex flex-col h-full justify-between p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-border-subtle mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand text-text-inverse flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-text-primary leading-tight">
                ReviewCards
              </h1>
              <p className="text-[10px] text-text-muted font-mono">
                Dynamic NFC & QR
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-800 transition-all duration-200 ease-out-expo active:scale-90"
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
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ease-out-expo text-start",
                  isActive
                    ? "bg-brand text-text-inverse shadow-xs"
                    : cn(
                        "text-text-secondary hover:text-text-primary hover:bg-surface-800",
                        isRTL ? "hover:-translate-x-0.5" : "hover:translate-x-0.5",
                      ),
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-text-inverse" : "text-text-muted",
                  )}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-border-subtle">
        <div
          className={cn(
            "border rounded-xl p-3 text-xs transition-all shadow-2xs",
            isAdmin
              ? "bg-status-info-bg border-status-info-border text-status-info-text"
              : "bg-surface-800 border-border-subtle text-text-secondary",
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
                  ? "bg-brand text-text-inverse"
                  : "bg-surface-800 text-text-secondary",
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
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-status-danger-text hover:bg-status-danger-bg rounded-lg transition-colors text-start"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 right-0 bg-surface-900 border-l border-border-subtle z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer stays mounted so the slide can play in both
          directions; `visibility` is deferred to the end of the
          transition so the panel is not focusable while closed. */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition-[visibility] duration-300 ease-in-out",
          isOpenMobile ? "visible" : "invisible pointer-events-none",
        )}
        aria-hidden={!isOpenMobile}
      >
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out",
            isOpenMobile ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 w-72 max-w-[85vw] h-full overflow-y-auto overscroll-contain bg-surface-900 border border-border-subtle shadow-2xl transition-transform duration-300 ease-in-out",
            isRTL ? "right-0" : "left-0",
            isOpenMobile
              ? "translate-x-0"
              : isRTL
                ? "translate-x-full"
                : "-translate-x-full",
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}

export const Sidebar = SidebarInner as <T extends Tab = Tab>(
  props: SidebarProps<T>,
) => React.ReactElement;