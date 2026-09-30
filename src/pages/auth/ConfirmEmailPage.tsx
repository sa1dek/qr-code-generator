import React, { useEffect, useState } from "react";
import { Radio, Mail, AlertCircle, CheckCircle2, LogIn } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import {
  getPendingVerificationEmail,
  resendVerificationEmail,
} from "../../features/auth/services/authService";
import { isEmail } from "../../validation/auth";

//--------------|| Confirm Email Notice ||--------------//
// Shown right after a successful registration when the Supabase project
// requires e-mail confirmation. The account exists but sign-in is blocked
// until the user opens the link that Supabase sent them.
//
// The address is read back from sessionStorage (written by signUpUser) so a
// refresh or a direct hit on this URL still works, and no e-mail ever lands in
// the query string / browser history.

const RESEND_COOLDOWN_SECONDS = 60;

interface ConfirmEmailPageProps {
  onGoToLogin: () => void;
  onGoHome: () => void;
}

export const ConfirmEmailPage: React.FC<ConfirmEmailPageProps> = ({
  onGoToLogin,
  onGoHome,
}) => {
  // Read once on mount - the stored value cannot change while this page is up.
  const [storedEmail] = useState(getPendingVerificationEmail);
  const [emailInput, setEmailInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(
    () => (getPendingVerificationEmail() ? RESEND_COOLDOWN_SECONDS : 0),
  );
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { success: toastSuccess, error: toastError } = useToast();

  const targetEmail = (emailInput || storedEmail).trim();

  //--------------|| Resend cooldown ||--------------//
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setErrorMsg(null);
    setSentMessage(null);

    if (!isEmail(targetEmail)) {
      setErrorMsg("أدخل بريداً إلكترونياً صحيحاً لإعادة إرسال رسالة التأكيد");
      return;
    }

    setIsSending(true);

    try {
      await resendVerificationEmail(targetEmail);
      const message = `تم إرسال رسالة التأكيد إلى ${targetEmail}`;
      setSentMessage(message);
      toastSuccess("تم إعادة إرسال رسالة التأكيد");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      const msg = err?.message || "تعذّر إعادة إرسال رسالة التأكيد";
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const needsEmailInput = !storedEmail && !emailInput.trim();

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
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-status-warning-bg text-status-warning-icon border border-status-warning-border flex items-center justify-center">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-text-primary">
            تحقّق من بريدك الإلكتروني
          </h2>
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            تم إنشاء حسابك بنجاح، لكنه غير مُفعّل بعد. سنرسل إليك رابط تفعيل على
            بريدك، ويجب الضغط عليه قبل تسجيل الدخول.
          </p>
        </div>

        {/*--------------|| Warning notice ||--------------*/}
        <div className="mt-5 p-3.5 bg-status-warning-bg border border-status-warning-border text-status-warning-text rounded-xl text-xs leading-relaxed">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-semibold">
                لن تتمكن من تسجيل الدخول قبل تأكيد بريدك الإلكتروني.
              </p>
              <ul className="list-disc pr-4 space-y-1 opacity-90">
                <li>افتح صندوق الوارد (Inbox) في بريدك الإلكتروني.</li>
                <li>ابحث عن رسالة من Supabase بعنوان «Confirm your signup».</li>
                <li>إذا لم تجدها، تأكد من مجلد الرسائل غير المرغوبة (Spam).</li>
                <li>اضغط على رابط التأكيد، ثم عد إلى هنا لتسجيل الدخول.</li>
              </ul>
            </div>
          </div>
        </div>

        {/*--------------|| Target address ||--------------*/}
        {storedEmail && (
          <div className="mt-5">
            <p className="text-[11px] text-text-muted mb-1.5">
              أُرسلت رسالة التأكيد إلى
            </p>
            <div className="dir-ltr text-left font-mono text-sm bg-surface-850 border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary break-all">
              {storedEmail}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-status-danger-bg border border-status-danger-border text-status-danger-text rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {sentMessage && (
          <div className="mt-4 p-3 bg-status-active-bg border border-status-active-border text-status-active-text rounded-xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-all">{sentMessage}</span>
          </div>
        )}

        {/*--------------|| Resend ||--------------*/}
        <div className="mt-5 space-y-3">
          {needsEmailInput && (
            <Input
              label="بريدك الإلكتروني"
              type="email"
              placeholder="name@example.com"
              value={emailInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmailInput(e.target.value)
              }
              leftElement={<Mail className="w-4 h-4" />}
              className="dir-ltr text-left font-mono"
              helperText="لم يُسجَّل بريد في هذه الجلسة، أدخله لإعادة إرسال رسالة التأكيد."
            />
          )}

          <Button
            type="button"
            variant="secondary"
            size="md"
            className="w-full"
            onClick={handleResend}
            isLoading={isSending}
            disabled={cooldown > 0}
            leftIcon={<Mail className="w-4 h-4" />}
          >
            {cooldown > 0
              ? `إعادة الإرسال بعد ${cooldown} ثانية`
              : "إعادة إرسال رسالة التأكيد"}
          </Button>

          <Button
            type="button"
            size="md"
            className="w-full"
            onClick={onGoToLogin}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            الذهاب إلى تسجيل الدخول
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-border-subtle text-center">
          <button
            type="button"
            onClick={onGoHome}
            className="text-xs text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1"
          >
            <span>العودة إلى الصفحة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
