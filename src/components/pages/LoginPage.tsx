import React, { useState } from "react";
import {
  Radio,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/Toast";
import { getSupabaseClient } from "../../lib/supabase/client";
import { AuthUser } from "../../types/card";

interface LoginPageProps {
  onLoginSuccess: (token: string, user: AuthUser) => void;
  onGoHome: () => void;
  dbMode: "supabase" | "mock";
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoHome,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState(""); // يمكن أن يكون Email أو Username عند الدخول، و Email فقط عند التسجيل
  const [username, setUsername] = useState(""); // خاص بإنشاء حساب جديد
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  // التحقق من قوة كلمة المرور
  const isStrongPassword = (pass: string) => {
    return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier || !password) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (isSignUp && !username.trim()) {
      setErrorMsg("يرجى إدخال اسم المستخدم (Username)");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMsg("كلمتا المرور غير متطابقتين");
        return;
      }
      if (!isStrongPassword(password)) {
        setErrorMsg(
          "كلمة المرور ضعيفة: يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير ورقم واحد على الأقل.",
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("تعذر الاتصال بقاعدة البيانات");
      }

      if (isSignUp) {
        const cleanUsername = username.trim().toLowerCase();

        // 1. التحقق من أن الـ Username غير مستخدم مسبقاً في جدول profiles لمنع التكرار
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", cleanUsername)
          .maybeSingle();

        if (existingProfile) {
          throw new Error(
            "اسم المستخدم (Username) مستخدم بالفعل، اختر اسمًا آخر.",
          );
        }

        // أثناء التسجيل الجديد، يتم تثبيت الدور دائماً كـ 'user'
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: identifier.trim(),
            password,
            options: {
              data: {
                username: cleanUsername,
                role: "user", // تثبيت الدور ليكون مستخدم عادي فقط لأي شخص يسجل من الخارج
              },
            },
          });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (signUpData.user) {
          setSuccessMsg("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
          success("تم إنشاء الحساب بنجاح");
          setIsSignUp(false);
          setPassword("");
          setConfirmPassword("");
          setUsername("");
          setIdentifier("");
        }
      } else {
        // تسجيل الدخول (يدعم الـ Username أو الـ Email)
        let targetEmail = identifier.trim();

        // إذا لم يدخل المستخدم الإيميل (لا يحتوي على @)، إذن هو أدخل الـ Username
        if (!targetEmail.includes("@")) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .eq("username", targetEmail.toLowerCase())
            .maybeSingle();

          if (profileError || !profileData) {
            throw new Error("اسم المستخدم (Username) غير موجود بالنظام");
          }
          targetEmail = profileData.email;
        }

        // تنفيذ تسجيل الدخول عبر البريد الإلكتروني المستخرج
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: targetEmail,
            password,
          });

        if (authError || !authData.user) {
          throw new Error(
            authError?.message || "بيانات الدخول أو كلمة المرور غير صحيحة",
          );
        }

        // جلب دور المستخدم ومعلوماته من جدول profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", authData.user.id)
          .maybeSingle();

        const role = profile?.role || "user";

        const userObj: AuthUser = {
          id: authData.user.id,
          email: authData.user.email || targetEmail,
          role: role,
          token: authData.session?.access_token,
        };

        success("تم تسجيل الدخول بنجاح");
        onLoginSuccess(authData.session?.access_token || "", userObj);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع");
      toastError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6"
      dir="rtl"
    >
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

      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp
              ? "أنشئ حسابك الخاص واسم المستخدم لإدارة كروتك بكل سهولة"
              : "أدخل اسم المستخدم أو البريد الإلكتروني للوصول إلى لوحة التحكم"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              label="اسم المستخدم (Username - فريد)"
              type="text"
              placeholder="e.g. ahmed_store"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftElement={<UserIcon className="w-4 h-4" />}
              required
              className="dir-ltr text-left font-mono"
              helperText="اختر اسم مستخدم فريداً لا يتكرر (يستخدم للتسجيل لاحقاً)."
            />
          )}

          <Input
            label={
              isSignUp
                ? "البريد الإلكتروني"
                : "اسم المستخدم أو البريد الإلكتروني"
            }
            type={isSignUp ? "email" : "text"}
            placeholder={
              isSignUp ? "name@example.com" : "Enter Username or Email"
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            leftElement={
              isSignUp ? (
                <Mail className="w-4 h-4" />
              ) : (
                <UserIcon className="w-4 h-4" />
              )
            }
            required
            className="dir-ltr text-left font-mono"
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
            helperText={
              isSignUp
                ? "يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير ورقم."
                : undefined
            }
          />

          {isSignUp && (
            <Input
              label="تأكيد كلمة المرور"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftElement={<Lock className="w-4 h-4" />}
              required
              className="dir-ltr text-left"
            />
          )}

          <Button
            type="submit"
            size="md"
            className="w-full"
            isLoading={isLoading}
          >
            {isSignUp ? "إتمام التسجيل" : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
              setPassword("");
              setConfirmPassword("");
              setUsername("");
              setIdentifier("");
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors inline-flex items-center gap-1.5"
          >
            {isSignUp ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>لديك حساب بالفعل؟ تسجيل الدخول</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>مستخدم جديد؟ أنشئ حساباً الآن</span>
              </>
            )}
          </button>

          <div className="pt-2">
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
