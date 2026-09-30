import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loading } from "../../../components/ui/Loading";
import { ShieldAlert } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen text="جاري التحقق من الصلاحيات..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="bg-[#212121] border border-[#333333] p-8 rounded-2xl max-w-md w-full space-y-4 text-center">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">غير مصرح لك بالوصول</h2>
          <p className="text-sm text-slate-400">
            هذه الصفحة تتطلب صلاحيات خاصة ({requiredRole}). حسابك الحالي لا يمتلك الصلاحية المطلوبة.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button size="sm" onClick={() => window.history.back()}>
              العودة للسابق
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.location.href = "/"}>
              الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
