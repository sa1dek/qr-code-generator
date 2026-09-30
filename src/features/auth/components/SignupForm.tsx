import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../hooks/useAuth";
import { PasswordInput } from "./PasswordInput";
import { isUsernameAvailable } from "../services/authService";
import type { SignUpResult } from "../types/auth";
import {
  normalizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
  USERNAME_TAKEN_MESSAGE,
} from "../../../validation/auth";

//--------------|| Signup Form ||--------------//
// Owns the username / email / password / confirm-password fields, the debounced
// username-availability check, and the submit handler.

type Availability = "idle" | "checking" | "available" | "taken";

export interface SignupFormProps {
  onSuccess?: (result: SignUpResult) => void;
  onSwitchToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuth();
  const { error: toastError } = useToast();

  const cleanUsername = normalizeUsername(username);
  const isUsernameValid = validateUsername(cleanUsername).isValid;

  //--------------|| Debounced availability check ||--------------//
  // Front-end half of the uniqueness rule. The authoritative check still runs
  // server-side inside signUpUser() / handle_new_user().
  useEffect(() => {
    if (!isUsernameValid) {
      setAvailability("idle");
      return;
    }

    let cancelled = false;
    setAvailability("checking");

    const timer = setTimeout(async () => {
      const taken = !(await isUsernameAvailable(cleanUsername));
      if (!cancelled) {
        setAvailability(taken ? "taken" : "available");
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cleanUsername, isUsernameValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const usernameValidation = validateUsername(cleanUsername);
    if (!usernameValidation.isValid) {
      setErrorMsg(usernameValidation.error || "اسم المستخدم غير صالح");
      return;
    }

    if (availability === "taken") {
      setErrorMsg(USERNAME_TAKEN_MESSAGE);
      toastError(USERNAME_TAKEN_MESSAGE);
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || "البريد الإلكتروني غير صالح");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.error || "كلمة المرور ضعيفة");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp({
        email: email.trim(),
        username: cleanUsername,
        password,
      });

      setPassword("");
      setConfirmPassword("");

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      const message = err?.message || "حدث خطأ غير متوقع";
      setErrorMsg(message);
      toastError(message);
      if (message === USERNAME_TAKEN_MESSAGE) {
        setAvailability("taken");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchToLogin = () => {
    setErrorMsg(null);
    setPassword("");
    setConfirmPassword("");
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
    <>
      {errorMsg && (
        <div className="mb-4 p-3 bg-status-danger-bg border border-status-danger-border text-status-danger-text rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/*--------------|| Username ||--------------*/}
        <div>
          <Input
            label="اسم المستخدم (Username - فريد)"
            type="text"
            placeholder="ahmed_store"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
            leftElement={<UserIcon className="w-4 h-4" />}
            required
            autoComplete="username"
            spellCheck={false}
            className="dir-ltr text-left font-mono"
            error={
              availability === "taken" ? USERNAME_TAKEN_MESSAGE : undefined
            }
            helperText={
              availability === "taken" ? undefined : (
                <span className="inline-flex items-center gap-1.5">
                  {availability === "checking" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {availability === "available" && (
                    <CheckCircle2 className="w-3 h-3 text-status-active-icon" />
                  )}
                  {availability === "checking"
                    ? "جارٍ التحقق من توفّر اسم المستخدم..."
                    : availability === "available"
                      ? "اسم المستخدم متاح ✓"
                      : "أحرف إنجليزية وأرقام و _ . - فقط (3 إلى 30 حرفاً)."}
                </span>
              )
            }
          />
        </div>

        {/*--------------|| Email ||--------------*/}
        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          leftElement={<Mail className="w-4 h-4" />}
          required
          autoComplete="email"
          className="dir-ltr text-left font-mono"
        />

        {/*--------------|| Password ||--------------*/}
        <PasswordInput
          label="كلمة المرور"
          placeholder="••••••••"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          leftElement={<Lock className="w-4 h-4" />}
          required
          autoComplete="new-password"
          className="dir-ltr text-left"
          helperText="8 أحرف على الأقل، وتحتوي على حرف كبير ورقم."
        />

        {/*--------------|| Confirm Password ||--------------*/}
        <PasswordInput
          label="تأكيد كلمة المرور"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
          leftElement={<Lock className="w-4 h-4" />}
          required
          autoComplete="new-password"
          className="dir-ltr text-left"
          error={
            confirmPassword && password !== confirmPassword
              ? "كلمتا المرور غير متطابقتين"
              : undefined
          }
        />

        <Button
          type="submit"
          size="md"
          className="w-full"
          isLoading={isSubmitting}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          إتمام التسجيل
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-border-subtle text-center">
        <button
          type="button"
          onClick={handleSwitchToLogin}
          className="text-xs text-brand hover:text-brand-light font-medium transition-colors"
        >
          لديك حساب بالفعل؟ تسجيل الدخول
        </button>
      </div>
    </>
  );
};
