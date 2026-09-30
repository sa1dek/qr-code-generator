import React, { useState } from "react";
import {
  Smartphone,
  QrCode,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { type Card, getCardStatus } from "../../../types/card";
import { getShortCardUrl } from "../../../utils/utils";

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

  if (!card) return null;

  const status = getCardStatus(card);
  const shortUrl = getShortCardUrl(card.card_id);

  //--------------|| Simulation Trigger Handler ||--------------//
  const handleSimulate = async (type: "nfc" | "qr") => {
    setIsSimulating(true);

    setTimeout(async () => {
      setIsSimulating(false);
      if (status === "active" && card.target_url) {
        if (onScanRecorded) onScanRecorded();
        window.open(
          `/r/${encodeURIComponent(card.card_id)}?ref=${type}`,
          "_blank",
        );
      } else {
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
      <div className="space-y-4 pt-1 text-start" dir="rtl">
        {/*--------------|| Smartphone Graphic Container ||--------------*/}
        <div className="bg-surface-800 text-text-primary rounded-2xl p-5 border border-border-subtle inset-shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-muted mb-4 border-b border-border-subtle pb-3">
            <span className="flex items-center gap-1.5 font-mono text-status-active-icon">
              <span className="w-2 h-2 rounded-full bg-status-active-icon animate-ping" />
              NFC TAG READY
            </span>
            <span className="font-mono bg-surface-850 border border-border-subtle px-2 py-0.5 rounded text-text-primary">
              {card.card_id}
            </span>
          </div>

          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-surface-850 border border-border-subtle mx-auto flex items-center justify-center text-text-secondary inset-shadow">
              <Smartphone className="w-8 h-8 text-status-info-icon" />
            </div>

            <p className="text-sm font-semibold text-text-primary">
              الرابط المبرمج في الكارت:
            </p>
            <div className="bg-surface-950 rounded-xl p-2.5 font-mono text-xs text-text-muted border border-border-subtle dir-ltr text-center break-all select-all">
              {shortUrl}
            </div>
          </div>

          {/*--------------|| Action Buttons ||--------------*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSimulate("nfc")}
              isLoading={isSimulating}
              leftIcon={<Smartphone className="w-4 h-4 text-status-info-icon" />}
            >
              محاكاة تمرير NFC
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSimulate("qr")}
              isLoading={isSimulating}
              leftIcon={<QrCode className="w-4 h-4 text-status-active-icon" />}
            >
              محاكاة مسح QR
            </Button>
          </div>
        </div>

        {/*--------------|| Expected Card Behavior Preview ||--------------*/}
        <div className="bg-surface-800/60 border border-border-subtle rounded-xl p-3.5 space-y-2 text-xs">
          <span className="font-bold text-text-primary block">
            ما الذي سيحدث للعميل عند المسح؟
          </span>

          {status === "active" ? (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-active-icon shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-status-active-text">
                  تحويل مباشر HTTP 302:
                </p>
                <p className="text-text-muted mt-0.5">
                  سيتم تسجيل عملية المسح في الإحصائيات فوراً، ثم تحويل العميل
                  مباشرة إلى رابط تقييم العميل:
                  <span className="block font-mono text-[11px] text-text-secondary dir-ltr truncate max-w-[320px] mt-0.5">
                    {card.target_url}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-status-unassigned-icon shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-status-unassigned-text">
                  ظهور صفحة تنبيه أنيقة:
                </p>
                <p className="text-text-muted mt-0.5">
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-info-text hover:text-status-info-icon bg-status-info-bg border border-status-info-border px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>فتح رابط التحويل في تبويب جديد</span>
          </a>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
};
