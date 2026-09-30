import React, { useState } from "react";
import { Edit2, QrCode, Smartphone, Copy, Check } from "lucide-react";
import type { Card } from "../../../types/card";
import { CardStatusBadge } from "../../cards/components/CardStatus";
import { getShortCardUrl } from "../../../utils/url";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../components/ui/Toast";

interface UserCardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onShowQR: (card: Card) => void;
  onSimulate: (card: Card) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  card,
  onEdit,
  onShowQR,
  onSimulate,
}) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();
  const shortUrl = getShortCardUrl(card.card_id);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    success("تم نسخ الرابط المختصر");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="surface rounded-2xl p-4 sm:p-5 space-y-4 hover:border-brand/40 hover:bg-surface-850 transition-all duration-200 ease-out-expo text-start"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-bold text-sm text-text-primary truncate">
            {card.card_id}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-text-muted hover:text-brand transition-colors"
            title="نسخ الرابط"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-status-active-icon" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <CardStatusBadge card={card} size="sm" />
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="text-text-muted">الاسم / النشاط:</div>
        <div className="font-medium text-text-secondary">
          {card.client_name || "غير محدد"}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="text-text-muted">رابط التوجيه (Google Reviews):</div>
        {card.target_url ? (
          <a
            href={card.target_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:text-brand-light transition-colors block truncate"
          >
            <span className="truncate">{card.target_url}</span>
          </a>
        ) : (
          <span className="text-text-disabled italic">
            لم يتم ربط رابط توجيه بعد
          </span>
        )}
      </div>

      <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-text-muted">
          مرات المسح:{" "}
          <span className="font-bold text-text-primary font-mono">
            {card.scan_count || 0}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onShowQR(card)}
            title="عرض كود QR"
            aria-label={`عرض كود QR للكارت ${card.card_id}`}
          >
            <QrCode className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSimulate(card)}
            title="محاكاة مسح الكارت"
            aria-label={`محاكاة مسح الكارت ${card.card_id}`}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(card)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            تعديل
          </Button>
        </div>
      </div>
    </div>
  );
};
