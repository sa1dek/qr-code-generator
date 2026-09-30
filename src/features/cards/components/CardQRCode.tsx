import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { getShortCardUrl } from "../../../utils/url";
import type { Card } from "../../../types/card";

interface CardQRCodeProps {
  card: Card;
  size?: number;
  showActions?: boolean;
}

export const CardQRCode: React.FC<CardQRCodeProps> = ({
  card,
  size = 180,
  showActions = true,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const shortUrl = getShortCardUrl(card.card_id);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR-${card.card_id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block"
      >
        <QRCodeSVG
          value={shortUrl}
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="space-y-1">
        <span className="font-mono font-bold text-sm text-text-primary block">
          {card.card_id}
        </span>
        <span className="text-[11px] text-text-muted font-mono break-all max-w-[240px] block">
          {shortUrl}
        </span>
      </div>

      {showActions && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            تنزيل PNG
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            طباعة
          </Button>
        </div>
      )}
    </div>
  );
};
