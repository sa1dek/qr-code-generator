import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, Copy, Check, ShieldAlert } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import type { Card } from "../../../types/card";
import { getShortCardUrl } from "../../../utils/utils";
import { useToast } from "../../../components/ui/Toast";

//--------------|| Component Props Interface ||--------------//
interface QRCodeModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
}

//--------------|| QR Code Modal Component ||--------------//
export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  card,
  isOpen,
  onClose,
}) => {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const shortUrl = card ? getShortCardUrl(card.card_id) : "";

  //--------------|| QR Code Data Generation ||--------------//
  useEffect(() => {
    if (isOpen && card && shortUrl) {
      QRCode.toDataURL(shortUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      })
        .then((url) => {
          setDataUrl(url);
        })
        .catch((err) => {
          console.error("Failed to generate QR:", err);
        });
    } else {
      setDataUrl("");
    }
  }, [isOpen, card, shortUrl]);

  if (!card) return null;

  //--------------|| Actions Handlers ||--------------//
  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    success("تم نسخ الرابط المختصر");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `QR_${card.card_id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success(`تم تحميل QR كود للكارت ${card.card_id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`رمز QR للكارت: ${card.card_id}`}
      description="رمز QR ثابت يشير إلى المعرف الديناميكي. يمكنك تغيير وجهة التقييم مستقبلاً دون الحاجة لتغيير هذا الرمز."
      maxWidth="md"
    >
      <div
        className="flex flex-col items-center text-center space-y-4 pt-1"
        dir="rtl"
      >
        {/*--------------|| Printable Card Display Area ||--------------*/}
        <div
          id="printable-qr"
          className="bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl p-6 w-full max-w-sm flex flex-col items-center shadow-xs"
        >
          <div className="flex items-center justify-between w-full border-b border-[#e2e8f0] pb-3 mb-4">
            <span className="text-xs font-bold text-[#475569]">
              DYNAMIC REVIEW CARD
            </span>
            <span className="font-mono text-xs font-bold bg-[#e2e8f0] text-[#1e293b] px-2 py-0.5 rounded-md">
              {card.card_id}
            </span>
          </div>

          {/*--------------|| QR Image Canvas ||--------------*/}
          <div className="p-3 bg-white border border-[#e2e8f0] rounded-xl inset-shadow-sm mb-3">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR Code for ${card.card_id}`}
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
              />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-[#f1f5f9] flex items-center justify-center text-xs text-[#64748b]">
                جاري توليد الرمز...
              </div>
            )}
          </div>

          <p className="text-xs font-semibold text-[#334155] mb-1">
            امسح لترك تقييم على خرائط جوجل
          </p>
          <p className="text-[11px] text-[#64748b] mb-3">
            Scan to leave a Google Review
          </p>

          {/*--------------|| Permanent URL Banner ||--------------*/}
          <div className="w-full bg-[#f1f5f9] rounded-lg p-2 border border-[#e2e8f0] text-center">
            <span className="font-mono text-[11px] text-[#475569] break-all select-all dir-ltr block">
              {shortUrl}
            </span>
          </div>

          {card.client_name && (
            <p className="text-xs text-[#64748b] mt-2 font-medium">
              العميل: {card.client_name}
            </p>
          )}
        </div>

        {/*--------------|| Dynamic Security Note ||--------------*/}
        <div className="w-full bg-status-info-bg border border-status-info-border rounded-xl p-3 text-right text-xs text-status-info-text flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-status-info-border text-status-info-icon shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-status-info-icon">
              قاعدة الأمان الديناميكية:{" "}
            </span>
            الرابط المخزن في QR و NFC هو رابط المعرف الثابت (
            <code className="font-mono">{`/r/${card.card_id}`}</code>
            ). أي تغيير لرابط المراجعة من لوحة التحكم سيُحدث الوجهة فوراً دون
            إعادة طباعة.
          </div>
        </div>

        {/*--------------|| Action Buttons Grid ||--------------*/}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={
              copied ? (
                <Check className="w-4 h-4 text-status-active-icon" />
              ) : (
                <Copy className="w-4 h-4" />
              )
            }
          >
            {copied ? "تم النسخ" : "نسخ الرابط"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            تحميل PNG
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="col-span-2 sm:col-span-1"
          >
            طباعة QR
          </Button>
        </div>
      </div>
    </Modal>
  );
};
