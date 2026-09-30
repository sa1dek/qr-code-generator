import React, { useState } from "react";
import { Lock, Mail, User as UserIcon, LogIn, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../hooks/useAuth";
import { validateEmail, validatePassword, validateUsername } from "../../../validation/auth";

interface LoginFormProps {
  onSuccess?: () => void;
  onGoHome?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onGoHome }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { login, signUp, isLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim() || !password) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (isSignUp) {
      const emailValidation = validateEmail(identifier);
      if (!emailValidation.isValid) {
        setErrorMsg(emailValidation.error || "البريد الإلكتروني غير صالح");
        return;
      }

      const usernameValidation = validateUsername(username);
      if (!usernameValidation.isValid) {
        setErrorMsg(usernameValidation.error || "اسم المستخدم غير صالح");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg("كلمتا المرور غير متطابقتين");
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setErrorMsg(passwordValidation.error || "كلمة المرور ضعيفة");
        return;
      }
    }

    try {
      if (isSignUp) {
        await signUp({
          email: identifier.trim(),
          username: username.trim(),
          password,
        });
        setSuccessMsg("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
        toastSuccess("تم إنشاء الحساب بنجاح");
        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
        setUsername("");
      } else {
        await login({
          identifier: identifier.trim(),
          password,
        });
        toastSuccess("تم تسجيل الدخول بنجاح");
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      const msg = err.message || "حدث خطأ غير متوقع";
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#212121] border border-[#2e2e2e] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-right" dir="rtl">
      <div>
        <h2 className="text-xl font-bold text-slate-100">
          {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isSignUp
            ? "أدخل بياناتك لإنشاء حساب والبدء في ربط كروتك"
            : "أدخل بريدك الإلكتروني أو اسم المستخدم وكلمة المرور"}
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp ? (
          <>
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
            <Input
              label="اسم المستخدم (Username)"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: ahmed_ali"
              leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
              required
            />
          </>
        ) : (
          <Input
            label="البريد الإلكتروني أو اسم المستخدم"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ادخل الإيميل أو الـ Username"
            leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
            required
          />
        )}

        <Input
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          required
        />

        {isSignUp && (
          <Input
            label="تأكيد كلمة المرور"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="lg"
          leftIcon={isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          className="mt-2"
        >
          {isSignUp ? "إنشاء الحساب" : "دخول اللوحة"}
        </Button>
      </form>

      <div className="pt-2 border-t border-[#2e2e2e] flex items-center justify-between text-xs text-slate-400">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className="text-[#f15827] hover:underline font-medium"
        >
          {isSignUp
            ? "لديك حساب بالفعل؟ تسجيل الدخول"
            : "ليس لديك حساب؟ إنشاء حساب جديد"}
        </button>

        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            className="hover:text-slate-200 transition-colors"
          >
            الرئيسية
          </button>
        )}
      </div>
    </div>
  );
};
