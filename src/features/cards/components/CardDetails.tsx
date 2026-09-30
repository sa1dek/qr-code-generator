import React from "react";
import { ExternalLink, Copy, Check, Radio } from "lucide-react";
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
    <div className={`space-y-4 text-right ${className || ""}`} dir="rtl">
      <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
        <div>
          <span className="text-xs text-slate-400 block font-mono">معرف الكارت</span>
          <span className="text-base font-bold text-slate-100 font-mono">{card.card_id}</span>
        </div>
        <CardStatusBadge card={card} />
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="text-slate-400 block mb-1">العميل / النشاط:</span>
          <span className="text-slate-200 font-medium">{card.client_name || "غير محدد"}</span>
        </div>

        <div>
          <span className="text-slate-400 block mb-1">رابط التوجيه:</span>
          {card.target_url ? (
            <a
              href={card.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f15827] hover:underline flex items-center gap-1.5 break-all"
            >
              <span>{card.target_url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          ) : (
            <span className="text-slate-500 italic">لم يتم تعيين رابط توجيه بعد</span>
          )}
        </div>

        <div>
          <span className="text-slate-400 block mb-1">الرابط المباشر (NFC/QR):</span>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e]">
            <span className="font-mono text-slate-300 truncate flex-1">{shortUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:text-[#f15827] text-slate-400 transition-colors"
              title="نسخ الرابط"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e]">
            <span className="text-slate-400 text-[11px] block">مرات المسح</span>
            <span className="text-lg font-bold text-slate-100 font-mono">{card.scan_count || 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e]">
            <span className="text-slate-400 text-[11px] block">تاريخ الإنشاء</span>
            <span className="text-xs font-medium text-slate-200 block truncate">
              {formatDateTime(card.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
