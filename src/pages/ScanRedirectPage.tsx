import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase/client";
import { recordCardScan } from "../features/cards/services/cardService";

export const ScanRedirectPage: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const [redirectError, setRedirectError] = useState<string | null>(null);

  useEffect(() => {
    const rawId = cardId || window.location.pathname.split("/r/")[1]?.split("?")[0]?.trim();
    if (!rawId) {
      setRedirectError("معرف الكارت غير صالح أو مفقود.");
      return;
    }

    const normalizedId = decodeURIComponent(rawId).trim().toUpperCase();

    const handleRedirect = async () => {
      try {
        const { data, error } = await supabase
          .from("cards")
          .select("target_url, is_active, scan_count")
          .eq("card_id", normalizedId)
          .single();

        if (error || !data) {
          setRedirectError("عذراً، هذا الكارت غير موجود في النظام.");
          return;
        }

        if (!data.is_active) {
          setRedirectError("عذراً، هذا الكارت غير مفعل حالياً.");
          return;
        }

        if (!data.target_url || !data.target_url.trim()) {
          setRedirectError("لم يتم ربط رابط توجيه لهذا الكارت بعد.");
          return;
        }

        // Record scan analytics
        await recordCardScan(normalizedId, {
          userAgent: navigator.userAgent,
          referer: document.referrer || undefined,
        });

        const target = data.target_url.trim();
        const finalUrl =
          target.startsWith("http://") || target.startsWith("https://")
            ? target
            : `https://${target}`;

        window.location.href = finalUrl;
      } catch {
        setRedirectError("حدث خطأ أثناء الاتصال بقاعدة البيانات.");
      }
    };

    handleRedirect();
  }, [cardId]);

  return (
    <div
      className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-4 text-center"
      dir="rtl"
    >
      {redirectError ? (
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-lg">
          <div className="w-12 h-12 bg-status-danger-bg text-status-danger-icon border border-status-danger-border rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-text-primary">تعذر التوجيه</h2>
          <p className="text-sm text-text-muted">{redirectError}</p>
          <div className="pt-2">
            <button
              onClick={() => (window.location.href = "/")}
              className="text-xs font-semibold text-brand hover:text-brand-light transition-colors"
            >
              الذهاب إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-text-secondary font-medium">
            جاري التوجيه...
          </p>
        </div>
      )}
    </div>
  );
};
