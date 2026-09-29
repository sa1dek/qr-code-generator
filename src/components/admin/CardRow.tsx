import React, { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
} from "lucide-react";
import { Card, getCardStatus, CardStatus } from "../../types/card";
import { getShortCardUrl } from "../../lib/utils";
import { useToast } from "../ui/Toast";

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

  const status: CardStatus = getCardStatus(card);
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
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-200/70 text-right group">
      {/*--------------|| Card ID & Short Link ||--------------*/}
      <td className="py-4 px-4 align-middle">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-900 tracking-wide">
              {card.card_id}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              title="نسخ رابط NFC / QR"
              className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <a
            href={`/r/${encodeURIComponent(card.card_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-blue-600 hover:text-blue-800 hover:underline dir-ltr text-right inline-flex items-center gap-1 max-w-[180px]"
            title="فتح رابط التحويل (تجربة الرابط)"
          >
            <span>/r/{card.card_id}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        </div>
      </td>

      {/*--------------|| Status Badge ||--------------*/}
      <td className="py-4 px-4 align-middle">
        {status === "active" && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مُفعّل (Active)</span>
          </span>
        )}
        {status === "unassigned" && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>غير مخصص (Unassigned)</span>
          </span>
        )}
        {status === "inactive" && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>معطل (Inactive)</span>
          </span>
        )}
      </td>

      {/*--------------|| Client Name ||--------------*/}
      <td className="py-4 px-4 align-middle font-medium text-sm text-slate-800">
        {card.client_name ? (
          <span>{card.client_name}</span>
        ) : (
          <span className="text-xs text-slate-400 italic">
            لم يُعيّن عميل بعد
          </span>
        )}
      </td>

      {/*--------------|| Target URL / Google Review Link ||--------------*/}
      <td className="py-4 px-4 align-middle max-w-[220px]">
        {card.target_url ? (
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-mono text-slate-500 truncate dir-ltr"
              title={card.target_url}
            >
              {card.target_url}
            </span>
            <a
              href={card.target_url}
              target="_blank"
              rel="noopener noreferrer"
              title="فتح رابط الوجهة مباشرة"
              className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 shrink-0 inline-flex items-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">—</span>
        )}
      </td>

      {/*--------------|| Scan Count ||--------------*/}
      <td className="py-4 px-4 align-middle text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 font-mono text-xs font-semibold text-slate-800">
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
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* QR Code Modal Trigger */}
          <button
            type="button"
            onClick={() => onShowQR(card)}
            title="عرض وطباعة QR Code"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Edit / Assign Modal Trigger */}
          <button
            type="button"
            onClick={() => onEdit(card)}
            title="تعديل أو تخصيص الكارت"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Trigger */}
          <button
            type="button"
            onClick={handleDeleteClick}
            title="حذف الكارت"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
