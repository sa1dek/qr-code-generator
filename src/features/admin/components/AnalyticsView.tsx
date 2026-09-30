import React from "react";
import type { Card, CardScan } from "../../../types/card";
import { formatDateRelative } from "../../../utils/utils";
import { Smartphone, QrCode, Shield, RefreshCw } from "lucide-react";

//--------------|| Component Props Interface ||--------------//
interface AnalyticsViewProps {
  cards: Card[];
  recentScans: CardScan[];
  isLoading: boolean;
  onRefresh: () => void;
}

//--------------|| Analytics View Component ||--------------//
export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  cards,
  recentScans,
  isLoading,
  onRefresh,
}) => {
  //--------------|| Top Performing Cards Calculation ||--------------//
  const topCards = [...cards].sort(
    (a, b) => (b.scan_count || 0) - (a.scan_count || 0),
  );
  const maxScans =
    topCards.length > 0
      ? Math.max(...topCards.map((c) => c.scan_count || 0), 1)
      : 1;

  return (
    <div className="space-y-6" dir="rtl">
      {/*--------------|| View Header ||--------------*/}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-text-primary">
            سجل المسحات والتحليلات
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            تتبع أداء الكروت ومسحات NFC ورموز QR في الوقت الفعلي مع الحفاظ على
            خصوصية المستخدمين (IP Anonymization).
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 shrink-0 border border-border-subtle bg-surface-800 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-750 transition-colors"
          title="تحديث"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/*--------------|| Top Engaging Cards Progress Bars ||--------------*/}
        <div className="lg:col-span-1 surface rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-text-primary">
            أكثر الكروت تفاعلاً
          </h3>
          <div className="space-y-3">
            {topCards.slice(0, 6).map((card) => {
              const pct = Math.round(((card.scan_count || 0) / maxScans) * 100);
              return (
                <div key={card.card_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-text-secondary">
                      {card.card_id}
                    </span>
                    <span className="text-text-muted font-mono text-[11px]">
                      {card.scan_count || 0} مسحة
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted truncate">
                    {card.client_name || "غير مخصص"}
                  </div>
                  <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500 ease-out-expo"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/*--------------|| Live Recorded Scans Stream ||--------------*/}
        <div className="lg:col-span-2 surface rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-text-primary">
              أحدث عمليات المسح المسجلة
            </h3>
            <span className="text-xs text-text-disabled font-mono">
              آخر 10 مسحات
            </span>
          </div>

          <div className="divide-y divide-border-subtle">
            {recentScans.length > 0 ? (
              recentScans.map((scan) => {
                const isNfc = (scan.referer || "")
                  .toLowerCase()
                  .includes("nfc");
                return (
                  <div
                    key={scan.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                          isNfc
                            ? "bg-status-info-bg text-status-info-icon border-status-info-border"
                            : "bg-status-active-bg text-status-active-icon border-status-active-border"
                        }`}
                      >
                        {isNfc ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <QrCode className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-text-primary truncate">
                            {scan.card_id}
                          </span>
                          <span className="text-[11px] text-text-muted bg-surface-800 border border-border-subtle px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                            {scan.referer || "مسح مباشر"}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-disabled truncate mt-0.5 dir-ltr text-right">
                          {scan.user_agent || "Mobile Device"}
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-text-muted block text-[11px] whitespace-nowrap">
                        {formatDateRelative(scan.scanned_at)}
                      </span>
                      <span className="text-[10px] font-mono text-text-disabled flex items-center gap-1 justify-end whitespace-nowrap">
                        <Shield className="w-2.5 h-2.5 shrink-0" />
                        {scan.ip_hash || "ip_anon"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-text-disabled text-xs">
                لم يتم تسجيل مسحات بعد. قم بتمرير كارت أو مسح QR كود للبدء.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
