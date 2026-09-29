import React from "react";
import type { Card, CardScan } from "../../types/card";
import { formatDateRelative, formatDateTime } from "../../lib/utils";
import { Smartphone, QrCode, Globe, Shield, RefreshCw } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            سجل المسحات والتحليلات
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تتبع أداء الكروت ومسحات NFC ورموز QR في الوقت الفعلي مع الحفاظ على
            خصوصية المستخدمين (IP Anonymization).
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          title="تحديث"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/*--------------|| Top Engaging Cards Progress Bars ||--------------*/}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">
            أكثر الكروت تفاعلاً
          </h3>
          <div className="space-y-3">
            {topCards.slice(0, 6).map((card) => {
              const pct = Math.round(((card.scan_count || 0) / maxScans) * 100);
              return (
                <div key={card.card_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-800">
                      {card.card_id}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {card.scan_count || 0} مسحة
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {card.client_name || "غير مخصص"}
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/*--------------|| Live Recorded Scans Stream ||--------------*/}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              أحدث عمليات المسح المسجلة
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              آخر 10 مسحات
            </span>
          </div>

          <div className="divide-y divide-slate-100">
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
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isNfc
                            ? "bg-blue-50 text-blue-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isNfc ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <QrCode className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {scan.card_id}
                          </span>
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {scan.referer || "مسح مباشر"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5 dir-ltr text-right">
                          {scan.user_agent || "Mobile Device"}
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-slate-500 block text-[11px]">
                        {formatDateRelative(scan.scanned_at)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 justify-end">
                        <Shield className="w-2.5 h-2.5" />
                        {scan.ip_hash || "ip_anon"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                لم يتم تسجيل مسحات بعد. قم بتمرير كارت أو مسح QR كود للبدء.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
