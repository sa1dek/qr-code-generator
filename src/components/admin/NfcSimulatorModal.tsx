import React, { useState } from "react";
import {
  Smartphone,
  QrCode,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { type Card, getCardStatus } from "../../types/card";
import { getShortCardUrl } from "../../lib/utils";

//--------------|| Component Props Interface ||--------------//
interface NfcSimulatorModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onScanRecorded?: () => void;
}

//--------------|| NFC Simulator Modal Component ||--------------//
export const NfcSimulatorModal: React.FC<NfcSimulatorModalProps> = ({
  card,
  isOpen,
  onClose,
  onScanRecorded,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<
    "idle" | "redirecting" | "blocked" | "error"
  >("idle");

  if (!card) return null;

  const status = getCardStatus(card);
  const shortUrl = getShortCardUrl(card.card_id);

  //--------------|| Simulation Trigger Handler ||--------------//
  const handleSimulate = async (type: "nfc" | "qr") => {
    setIsSimulating(true);
    setResult("idle");

    setTimeout(async () => {
      setIsSimulating(false);
      if (status === "active" && card.target_url) {
        setResult("redirecting");
        if (onScanRecorded) onScanRecorded();
        window.open(
          `/r/${encodeURIComponent(card.card_id)}?ref=${type}`,
          "_blank",
        );
      } else {
        setResult("blocked");
        window.open(
          `/r/${encodeURIComponent(card.card_id)}?ref=${type}`,
          "_blank",
        );
      }
    }, 700);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`محاكاة مسح الكارت: ${card.card_id}`}
      description="اختبار سلوك الكارت الفعلي عند تمريره على هاتف يدعم NFC أو مسحه بكاميرا QR Code."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1 text-right" dir="rtl">
        {/*--------------|| Smartphone Graphic Container ||--------------*/}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 border-b border-slate-800 pb-3">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              NFC TAG READY
            </span>
            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-white">
              {card.card_id}
            </span>
          </div>

          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-300 shadow-inner">
              <Smartphone className="w-8 h-8 text-blue-400" />
            </div>

            <p className="text-sm font-semibold text-slate-200">
              الرابط المبرمج في الكارت:
            </p>
            <div className="bg-slate-950 rounded-xl p-2.5 font-mono text-xs text-slate-400 border border-slate-800 dir-ltr text-center break-all select-all">
              {shortUrl}
            </div>
          </div>

          {/*--------------|| Action Buttons ||--------------*/}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSimulate("nfc")}
              isLoading={isSimulating}
              leftIcon={<Smartphone className="w-4 h-4 text-blue-500" />}
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
            >
              محاكاة تمرير NFC
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSimulate("qr")}
              isLoading={isSimulating}
              leftIcon={<QrCode className="w-4 h-4 text-emerald-500" />}
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
            >
              محاكاة مسح QR
            </Button>
          </div>
        </div>

        {/*--------------|| Expected Card Behavior Preview ||--------------*/}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
          <span className="font-bold text-slate-800 block">
            ما الذي سيحدث للعميل عند المسح؟
          </span>

          {status === "active" ? (
            <div className="flex items-start gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">تحويل مباشر HTTP 302:</p>
                <p className="text-slate-600 mt-0.5">
                  سيتم تسجيل عملية المسح في الإحصائيات فوراً، ثم تحويل العميل
                  مباشرة إلى رابط تقييم العميل:
                  <span className="block font-mono text-[11px] text-slate-700 dir-ltr truncate max-w-[320px] mt-0.5">
                    {card.target_url}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">ظهور صفحة تنبيه أنيقة:</p>
                <p className="text-slate-600 mt-0.5">
                  الكارت غير مخصص أو غير مفعل، لذلك لن يتم تحويل العميل لصفحة
                  خطأ 404 أو خطأ تقني، بل ستظهر صفحة تفيد بأن الكارت قيد التجهيز
                  والتفعيل.
                </p>
              </div>
            </div>
          )}
        </div>

        {/*--------------|| Modal Footer ||--------------*/}
        <div className="flex items-center justify-between pt-2">
          <a
            href={`/r/${encodeURIComponent(card.card_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <span>فتح رابط التحويل في تبويب جديد</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
};
