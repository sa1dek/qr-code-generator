import React, { useState } from 'react';
import { 
  QrCode, 
  Zap, 
  BarChart3, 
  ArrowLeft, 
  ExternalLink, 
  Smartphone, 
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  onGoToLogin: () => void;
  onGoToDashboard: () => void;
  isAuthenticated: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onGoToLogin,
  onGoToDashboard,
  isAuthenticated,
}) => {
  const [testCardId, setTestCardId] = useState('CARD-001');

  const handleTestRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (testCardId.trim()) {
      window.open(`/r/${encodeURIComponent(testCardId.trim())}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] text-[#f5f5f5] font-sans dir-rtl selection:bg-[#f15827] selection:text-white">
      {/* Header / Navbar - تجاوب متناسق لمنع التداخل على الموبايل */}
      <header className="border-b border-[#2e2e2e] bg-[#212121] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#f15827] flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-wide block leading-tight">
                  Dynamic Review Cards
                </span>
                <span className="text-[11px] text-[#a3a3a3] block">
                  نظام كروت NFC و QR التفاعلية
                </span>
              </div>
            </div>

            {/* زر الدخول على الموبايل يكون مدمجاً بجانب اللوجو لتوفير المساحة */}
            <div className="sm:hidden">
              {isAuthenticated ? (
                <button
                  onClick={onGoToDashboard}
                  className="bg-[#f15827] text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                >
                  <span>الداشبورد</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={onGoToLogin}
                  className="bg-[#f15827] text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                >
                  <span>دخول</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* أزرار الهيدر على الشاشات العادية */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onGoToDashboard}
                className="inline-flex items-center gap-2 bg-[#f15827] hover:bg-[#d9481b] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
              >
                <span>لوحة التحكم (Dashboard)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoToLogin}
                className="inline-flex items-center gap-2 bg-[#f15827] hover:bg-[#d9481b] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
              >
                <span>تسجيل الدخول</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f15827]/10 border border-[#f15827]/30 text-[#f15827] text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>توجيه فوري بدون إعادة برمجية الكارت</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Dynamic Review Cards
          </h1>

          <p className="text-sm sm:text-base text-[#a3a3a3] leading-relaxed max-w-2xl mx-auto">
            اربط كروت التقييم الثابتة بروالمتغيرة Google Review في أي وقت، دون الحاجة لإعادة طباعة الكارت أو برمجته مجدداً. Manage your NFC & QR review cards from one dashboard.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onGoToDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f15827] hover:bg-[#d9481b] text-white px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200"
              >
                <span>الدخول إلى لوحة التحكم</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoToLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f15827] hover:bg-[#d9481b] text-white px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200"
              >
                <span>الدخول إلى لوحة التحكم</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <a
              href="/r/CARD-001"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#212121] hover:bg-[#2a2a2a] text-[#f5f5f5] border border-[#2e2e2e] px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4 text-[#f15827]" />
              <span>تجربة مسح كارت نشط (/r/CARD-001)</span>
            </a>
          </div>
        </div>

        {/* Quick Redirect Tester Card */}
        <div className="mt-12 max-w-2xl mx-auto bg-[#212121] border border-[#2e2e2e] rounded-2xl p-5 sm:p-7 shadow-xl">
          <div className="text-center space-y-1.5 mb-5">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f15827]" />
              <span>تجربة فاحص الروابط الديناميكية (Quick Redirect Tester)</span>
            </h2>
            <p className="text-xs text-[#a3a3a3]">
              جرب كتابة أي معرف كارت لمعرفة كيفية استجابة النظام (نشط، غير مخصص، أو غير موجود):
            </p>
          </div>

          <form onSubmit={handleTestRedirect} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={testCardId}
              onChange={(e) => setTestCardId(e.target.value)}
              placeholder="CARD-001"
              className="w-full bg-[#171717] border border-[#2e2e2e] text-white text-sm rounded-xl py-2.5 px-3.5 outline-none font-mono dir-ltr"
            />
            <button
              type="submit"
              className="bg-[#f15827] hover:bg-[#d9481b] text-white px-5 py-2.5 rounded-xl font-bold text-sm shrink-0 transition-all"
            >
              اختبار التوجيه
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#2e2e2e] flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[#a3a3a3]">نماذج سريعة:</span>
            <button
              type="button"
              onClick={() => { setTestCardId('CARD-001'); window.open('/r/CARD-001', '_blank'); }}
              className="px-2 py-0.5 rounded bg-[#171717] border border-[#2e2e2e] text-emerald-400 font-mono"
            >
              CARD-001 (Active)
            </button>
            <button
              type="button"
              onClick={() => { setTestCardId('CARD-004'); window.open('/r/CARD-004', '_blank'); }}
              className="px-2 py-0.5 rounded bg-[#171717] border border-[#2e2e2e] text-amber-400 font-mono"
            >
              CARD-004 (Unassigned)
            </button>
            <button
              type="button"
              onClick={() => { setTestCardId('CARD-999'); window.open('/r/CARD-999', '_blank'); }}
              className="px-2 py-0.5 rounded bg-[#171717] border border-[#2e2e2e] text-rose-400 font-mono"
            >
              CARD-999 (Not Found)
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#212121] border border-[#2e2e2e] p-5 rounded-2xl space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f15827]/10 text-[#f15827] flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">دعم كامل لـ NFC</h3>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              كارت مبرمج بعنوان ثابت يوجه تلقائياً إلى رابط تقييم العميل على هواتف Android و iOS.
            </p>
          </div>

          <div className="bg-[#212121] border border-[#2e2e2e] p-5 rounded-2xl space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f15827]/10 text-[#f15827] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">مولد QR Code ديناميكي</h3>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              توليد وطباعة وتنزيل رموز QR عالية الدقة تشير إلى المعرف المتجدد.
            </p>
          </div>

          <div className="bg-[#212121] border border-[#2e2e2e] p-5 rounded-2xl space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f15827]/10 text-[#f15827] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">خصوصية وتحليلات مسح</h3>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              إحصائيات تفصيلية لعدد المسحات مع تشفير وإخفاء عناوين IP احتراماً للخصوصية.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};