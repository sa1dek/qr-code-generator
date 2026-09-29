import React, { useState } from "react";
import {
  Radio,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/Toast";
import { safeFetchJson } from "../../lib/fetchUtils";

//--------------|| Component Props Interface ||--------------//
interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  onGoHome: () => void;
  dbMode: "supabase" | "mock";
}

//--------------|| Login Page Component ||--------------//
export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoHome,
  dbMode,
}) => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  //--------------|| Form Submission Handler ||--------------//
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { ok, data } = await safeFetchJson("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!ok || !data?.success) {
        throw new Error(data?.error || "فشل تسجيل الدخول");
      }

      success("تم تسجيل الدخول بنجاح");
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message || "فشل تسجيل الدخول");
      toastError(err.message || "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  //--------------|| Quick Demo Admin Login Handler ||--------------//
  const handleQuickDemoLogin = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    setTimeout(() => {
      onLoginSuccess("mock_token_" + Date.now(), {
        email: "admin@example.com",
        role: "admin",
        name: "المشرف",
      });
      success("تم الدخول السريع كمسؤول للنظام");
    }, 100);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6"
      dir="rtl"
    >
      {/*--------------|| Top Brand Header ||--------------*/}
      <div className="mb-6 text-center">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center gap-2.5 p-2 rounded-xl text-slate-900 hover:bg-slate-200/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5" />
          </div>
          <div className="text-right">
            <h1 className="font-bold text-base text-slate-900">
              Dynamic Review Cards
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">
              لوحة إدارة الكروت والمراجعات
            </p>
          </div>
        </button>
      </div>

      {/*--------------|| Authentication Card ||--------------*/}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            تسجيل الدخول للمسؤول
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أدخل بيانات الدخول للوصول إلى لوحة التحكم وإدارة الكروت
          </p>
        </div>

        {/*--------------|| Error Banner ||--------------*/}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/*--------------|| Credentials Form ||--------------*/}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftElement={<Mail className="w-4 h-4" />}
            required
            className="dir-ltr text-left"
          />

          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftElement={<Lock className="w-4 h-4" />}
            required
            className="dir-ltr text-left"
          />

          <Button
            type="submit"
            size="md"
            className="w-full"
            isLoading={isLoading}
          >
            تسجيل الدخول
          </Button>
        </form>

        {/*--------------|| Demo Access & Actions ||--------------*/}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>بيانات المشرف التجريبي:</span>
            <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
              admin@example.com
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleQuickDemoLogin}
            className="w-full text-xs"
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          >
            دخول مباشر سريع (Demo Admin 1-Click)
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onGoHome}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى الصفحة الرئيسية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
