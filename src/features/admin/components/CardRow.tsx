import React, { useState } from "react";
import { Copy, Check, QrCode, Edit2, Trash2, Eye } from "lucide-react";
import { Card } from "../../../types/card";
import { getShortCardUrl } from "../../../utils/utils";
import { useToast } from "../../../components/ui/Toast";
import { CardStatusBadge } from "../../cards/components/CardStatus";

//--------------|| Component Props Interface ||--------------//
interface CardRowProps {
  card: Card;
  onEdit: (card: Card) => void;
  onShowQR: (card: Card) => void;
  onDelete: (card: Card) => void;
  onSimulateScan: (card: Card) => void;
}

//--------------|| Card Row Component ||--------------//
export const CardRow: React.FC<CardRowProps> = ({
  card,
  onEdit,
  onShowQR,
  onDelete,
  onSimulateScan,
}) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const shortUrl = getShortCardUrl(card.card_id);

  //--------------|| Copy Link Handler ||--------------//
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    success("تم نسخ الرابط المختصر للكارت");
    setTimeout(() => setCopied(false), 2000);
  };

  //--------------|| Delete Handler ||--------------//
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(card);
  };

  return (
    <tr className="hover:bg-surface-800/40 transition-colors duration-150 border-b border-border-subtle text-right group">
      {/*--------------|| Card ID & Short Link ||--------------*/}
      <td className="py-4 px-4 align-middle">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-text-primary tracking-wide">
              {card.card_id}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              title="نسخ رابط NFC / QR"
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-800 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-status-active-icon" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <a
            href={`/r/${encodeURIComponent(card.card_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-brand hover:text-brand-light transition-colors dir-ltr text-right block max-w-[180px] truncate"
            title="فتح رابط التحويل (تجربة الرابط)"
          >
            /r/{card.card_id}
          </a>
        </div>
      </td>

      {/*--------------|| Status Badge ||--------------*/}
      <td className="py-4 px-4 align-middle">
        <CardStatusBadge card={card} size="md" />
      </td>

      {/*--------------|| Client Name ||--------------*/}
      <td className="py-4 px-4 align-middle font-medium text-sm text-text-secondary">
        {card.client_name ? (
          <span>{card.client_name}</span>
        ) : (
          <span className="text-xs text-text-disabled italic">
            لم يُعيّن عميل بعد
          </span>
        )}
      </td>

      {/*--------------|| Target URL / Google Review Link ||--------------*/}
      <td className="py-4 px-4 align-middle max-w-[220px]">
        {card.target_url ? (
          <a
            href={card.target_url}
            target="_blank"
            rel="noopener noreferrer"
            title="فتح رابط الوجهة مباشرة"
            className="block text-xs font-mono text-brand hover:text-brand-light transition-colors truncate dir-ltr"
          >
            {card.target_url}
          </a>
        ) : (
          <span className="text-xs text-text-disabled italic">—</span>
        )}
      </td>

      {/*--------------|| Scan Count ||--------------*/}
      <td className="py-4 px-4 align-middle text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-800 border border-border-subtle font-mono text-xs font-semibold text-text-primary">
          {(card.scan_count || 0).toLocaleString()}
        </span>
      </td>

      {/*--------------|| Row Actions ||--------------*/}
      <td className="py-4 px-4 align-middle text-left">
        <div className="flex items-center justify-end gap-1">
          {/* Scan Simulator */}
          <button
            type="button"
            onClick={() => onSimulateScan(card)}
            title="محاكاة مسح الكارت عبر NFC / QR"
            className="p-1.5 rounded-lg bg-surface-800 text-text-muted hover:text-text-primary hover:bg-surface-750 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* QR Code Modal Trigger */}
          <button
            type="button"
            onClick={() => onShowQR(card)}
            title="عرض وطباعة QR Code"
            className="p-1.5 rounded-lg bg-status-info-bg text-status-info-icon hover:bg-status-info-border transition-colors"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Edit / Assign Modal Trigger */}
          <button
            type="button"
            onClick={() => onEdit(card)}
            title="تعديل أو تخصيص الكارت"
            className="p-1.5 rounded-lg bg-surface-800 text-text-muted hover:text-text-primary hover:bg-surface-750 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Trigger */}
          <button
            type="button"
            onClick={handleDeleteClick}
            title="حذف الكارت"
            className="p-1.5 rounded-lg bg-surface-800 text-text-muted hover:text-status-danger-icon hover:bg-status-danger-border transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
