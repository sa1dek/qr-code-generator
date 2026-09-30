import React, { useState } from "react";
import { ExternalLink, Edit2, QrCode, Smartphone, Copy, Check } from "lucide-react";
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
    <div className="bg-[#212121] border border-[#2e2e2e] rounded-2xl p-5 space-y-4 hover:border-[#f15827]/40 transition-colors text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-slate-100">
            {card.card_id}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 hover:text-[#f15827] text-slate-400 transition-colors"
            title="نسخ الرابط"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <CardStatusBadge card={card} size="sm" />
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="text-slate-400">الاسم / النشاط:</div>
        <div className="font-medium text-slate-200">
          {card.client_name || "غير محدد"}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="text-slate-400">رابط التوجيه (Google Reviews):</div>
        {card.target_url ? (
          <a
            href={card.target_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f15827] hover:underline flex items-center gap-1.5 truncate"
          >
            <span className="truncate">{card.target_url}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        ) : (
          <span className="text-slate-500 italic">لم يتم ربط رابط توجيه بعد</span>
        )}
      </div>

      <div className="pt-3 border-t border-[#2e2e2e] flex items-center justify-between text-xs">
        <div className="text-slate-400">
          مرات المسح: <span className="font-bold text-slate-200 font-mono">{card.scan_count || 0}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onShowQR(card)}
            title="عرض كود QR"
          >
            <QrCode className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSimulate(card)}
            title="محاكاة مسح الكارت"
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
