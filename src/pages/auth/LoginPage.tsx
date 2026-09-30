import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radio,
  Lock,
  User as UserIcon,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { SignupForm } from "../../features/auth/components/SignupForm";
import { PasswordInput } from "../../features/auth/components/PasswordInput";
import type { SignUpResult } from "../../features/auth/types/auth";
import {
  validateLoginIdentifier,
  validatePassword,
} from "../../validation/auth";
import { AuthUser } from "../../types/card";

interface LoginPageProps {
  onLoginSuccess: (token: string, user: AuthUser) => void;
  onGoHome: () => void;
  dbMode: "supabase" | "mock";
  /** Opens straight on the registration form (used by the /signup route). */
  initialMode?: "login" | "signup";
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoHome,
  initialMode = "login",
}) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [identifier, setIdentifier] = useState(""); // Email أو Username عند الدخول
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { success, error: toastError } = useToast();
  const { login, refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim() || !password) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // الدخول يقبل البريد الإلكتروني أو اسم المستخدم
    const identifierValidation = validateLoginIdentifier(identifier);
    if (!identifierValidation.isValid) {
      setErrorMsg(identifierValidation.error || "بيانات الدخول غير صالحة");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.error || "كلمة المرور ضعيفة");
      return;
    }

    setIsLoading(true);

    try {
      const { token, user } = await login({
        identifier: identifier.trim(),
        password,
      });

      success("تم تسجيل الدخول بنجاح");
      onLoginSuccess(token, user);
    } catch (err: any) {
      const msg = err?.message || "حدث خطأ غير متوقع";
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword("");
    setIsSignUp(false);
  };

  // Registration succeeded. Never bounce straight back to the login form:
  // when the project requires e-mail confirmation the account exists but
  // cannot sign in yet, so the user gets a dedicated notice screen instead.
  const handleSignUpComplete = async (result: SignUpResult) => {
    if (result.requiresEmailConfirmation) {
      navigate("/auth/confirm-email");
      return;
    }

    // "Confirm email" is disabled for this project, so Supabase already
    // issued a session - adopt it and go straight to the dashboard.
    const refreshed = await refreshUser();
    navigate(refreshed?.role === "admin" ? "/admin" : "/user");
  };

  const switchToSignUp = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword("");
    setIdentifier("");
    setIsSignUp(true);
  };

  return (
    <div
      className="min-h-screen bg-bg-primary flex flex-col justify-center items-center p-4 sm:p-6"
      dir="rtl"
    >
      <div className="mb-6 text-center">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center gap-2.5 p-2 rounded-xl text-text-primary hover:bg-surface-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-brand text-text-inverse flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5" />
          </div>
          <div className="text-start">
            <h1 className="font-bold text-base text-text-primary">
              Dynamic Review Cards
            </h1>
            <p className="text-[11px] text-text-muted font-mono">
              لوحة إدارة الكروت والمراجعات
            </p>
          </div>
        </button>
      </div>

      <div className="w-full max-w-md surface-elevated rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {isSignUp
              ? "أنشئ حسابك الخاص واسم المستخدم لإدارة كروتك بكل سهولة"
              : "أدخل اسم المستخدم أو البريد الإلكتروني للوصول إلى لوحة التحكم"}
          </p>
        </div>

        {isSignUp ? (
          <SignupForm
            onSuccess={handleSignUpComplete}
            onSwitchToLogin={switchToLogin}
          />
        ) : (
          <>
            {errorMsg && (
              <div className="mb-4 p-3 bg-status-danger-bg border border-status-danger-border text-status-danger-text rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-status-active-bg border border-status-active-border text-status-active-text rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="البريد الإلكتروني أو اسم المستخدم"
                type="text"
                placeholder="اسم المستخدم أو البريد"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIdentifier(e.target.value)
                }
                leftElement={<UserIcon className="w-4 h-4" />}
                required
                autoComplete="username"
                className="dir-ltr text-left font-mono"
              />

              <PasswordInput
                label="كلمة المرور"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                leftElement={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
                className="dir-ltr text-left"
              />

              <Button
                type="submit"
                size="md"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                تسجيل الدخول
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border-subtle space-y-3 text-center">
              <button
                type="button"
                onClick={switchToSignUp}
                className="text-xs text-brand hover:text-brand-light font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>مستخدم جديد؟ أنشئ حساباً الآن</span>
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onGoHome}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>العودة إلى الصفحة الرئيسية</span>
                </button>
              </div>
            </div>
          </>
        )}

        {isSignUp && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onGoHome}
              className="text-xs text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1"
            >
              <span>العودة إلى الصفحة الرئيسية</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
