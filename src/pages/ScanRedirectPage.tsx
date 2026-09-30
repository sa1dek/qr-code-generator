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
    <div className="min-h-screen bg-[#171717] text-white flex flex-col items-center justify-center p-4 text-center" dir="rtl">
      {redirectError ? (
        <div className="bg-[#212121] border border-[#333333] p-6 sm:p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-100">تعذر التوجيه</h2>
          <p className="text-sm text-slate-400">{redirectError}</p>
          <div className="pt-2">
            <button
              onClick={() => (window.location.href = "/")}
              className="text-xs text-[#f15827] hover:underline"
            >
              الذهاب إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-[#f15827] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">
            جاري توجيهك إلى صفحة التقييم...
          </p>
        </div>
      )}
    </div>
  );
};
