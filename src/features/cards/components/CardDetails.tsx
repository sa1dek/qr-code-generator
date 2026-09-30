import React from "react";
import { Copy, Check } from "lucide-react";
import { CardStatusBadge } from "./CardStatus";
import { getShortCardUrl } from "../../../utils/url";
import { formatDateTime } from "../../../utils/date";
import type { Card } from "../../../types/card";
import { useToast } from "../../../components/ui/Toast";

interface CardDetailsProps {
  card: Card;
  className?: string;
}

export const CardDetails: React.FC<CardDetailsProps> = ({ card, className }) => {
  const [copied, setCopied] = React.useState(false);
  const { success } = useToast();
  const shortUrl = getShortCardUrl(card.card_id);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    success("تم نسخ الرابط المختصر");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-4 text-start ${className || ""}`} dir="rtl">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="min-w-0">
          <span className="text-xs text-text-muted block font-mono">معرف الكارت</span>
          <span className="text-base font-bold text-text-primary font-mono truncate block">
            {card.card_id}
          </span>
        </div>
        <CardStatusBadge card={card} />
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="text-text-muted block mb-1">العميل / النشاط:</span>
          <span className="text-text-secondary font-medium">{card.client_name || "غير محدد"}</span>
        </div>

        <div>
          <span className="text-text-muted block mb-1">رابط التوجيه:</span>
          {card.target_url ? (
            <a
              href={card.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:text-brand-light transition-colors block break-all"
            >
              <span>{card.target_url}</span>
            </a>
          ) : (
            <span className="text-text-disabled italic">لم يتم تعيين رابط توجيه بعد</span>
          )}
        </div>

        <div>
          <span className="text-text-muted block mb-1">الرابط المباشر (NFC/QR):</span>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-800/60 border border-border-subtle">
            <span className="font-mono text-text-secondary truncate flex-1">{shortUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-text-muted hover:text-brand hover:bg-surface-800 transition-colors"
              title="نسخ الرابط"
            >
              {copied ? <Check className="w-4 h-4 text-status-active-icon" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-800/60 border border-border-subtle">
            <span className="text-text-muted text-[11px] block">مرات المسح</span>
            <span className="text-lg font-bold text-text-primary font-mono">{card.scan_count || 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-800/60 border border-border-subtle">
            <span className="text-text-muted text-[11px] block">تاريخ الإنشاء</span>
            <span className="text-xs font-medium text-text-secondary block truncate">
              {formatDateTime(card.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
