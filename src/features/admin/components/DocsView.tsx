import React from "react";
import { Smartphone, QrCode, Cpu } from "lucide-react";
import { getBaseAppUrl } from "../../../utils/utils";

//--------------|| Documentation View Component ||--------------//
export const DocsView: React.FC = () => {
  const origin = getBaseAppUrl();

  const steps = [
    {
      title: "تحميل تطبيق NFC Tools",
      body: "التطبيق مجاني على كل من iOS (App Store) و Android (Google Play).",
    },
    {
      title: "نسخ رابط الكارت المختصر من لوحة التحكم",
      body: "اضغط على زر النسخ بجوار الكارت، ستحصل على رابط مثل:",
      code: `${origin}/r/CARD-001`,
    },
    {
      title: "كتابة الرابط في الشريحة (Write URI)",
      body: "في تطبيق NFC Tools، اختر Write → Add a record → Custom URL / URI، ثم الصق الرابط واضغط Write ومرر الكارت خلف الهاتف.",
    },
    {
      title: "حماية الشريحة (اختياري)",
      body: "يمكنك قفل الشريحة (Lock) لمنع أي شخص من الكتابة عليها، والرابط سيظل قابلاً للتحديث دوماً عبر لوحة التحكم الخاصة بك.",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl text-start" dir="rtl">
      {/*--------------|| Page Header ||--------------*/}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-text-primary">
          دليل برمجة واستخدام كروت NFC و QR الديناميكية
        </h2>
        <p className="text-xs text-text-muted mt-1">
          شرح متكامل لكيفية برمجة الشرائح وطباعة الرموز وإعادة توجيهها
          ديناميكياً دون لمس الكارت الفعلي.
        </p>
      </div>

      {/*--------------|| Dynamic Core Architecture Box ||--------------*/}
      <div className="surface p-4 sm:p-6 rounded-2xl shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
          <Cpu className="w-4 h-4 text-text-muted shrink-0" />
          <span>القاعدة الذهبية للنظام (The Dynamic Core)</span>
        </h3>

        <div className="p-4 bg-surface-800/60 rounded-xl border border-border-subtle font-mono text-xs text-text-secondary space-y-2 dir-ltr">
          <div className="flex flex-wrap items-center gap-2 font-bold text-text-primary break-all">
            <span>NFC Card / QR Code</span>
            <span>&rarr;</span>
            <span className="text-brand break-all">{origin}/r/CARD-001</span>
          </div>
          <div className="pl-6 text-text-muted">
            &darr; (Database lookup &amp; Scan Counter)
          </div>
          <div className="flex flex-wrap items-center gap-2 font-bold text-status-active-text break-all">
            <span>HTTP 302 Redirect</span>
            <span>&rarr;</span>
            <span className="text-status-active-icon break-all">
              https://search.google.com/local/writereview?placeid=...
            </span>
          </div>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          <strong className="text-text-secondary">السر في النظام:</strong> يتم
          حرق أو طباعة الرابط الثابت{" "}
          <code className="font-mono text-text-primary bg-surface-800 border border-border-subtle px-1.5 py-0.5 rounded">{`${origin}/r/CARD-XXX`}</code>{" "}
          فقط على الكارت. عندما يقوم العميل بتغيير فرع المطعم أو تحديث رابط
          التقييم الخاص به على Google، يتم تعديل الرابط في لوحة التحكم بضغطة زر،
          ويعمل الكارت فوراً بالرابط الجديد دون الحاجة لإعادة طباعته أو إعادة
          برمجته!
        </p>
      </div>

      {/*--------------|| NFC Programming Steps ||--------------*/}
      <div className="surface p-4 sm:p-6 rounded-2xl shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-status-info-icon shrink-0" />
          <span>طريقة برمجة كارت NFC (باستخدام شريحة NTAG213 / NTAG215)</span>
        </h3>

        <div className="space-y-3 text-xs text-text-muted">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-surface-800 border border-border-subtle text-text-primary font-bold flex items-center justify-center shrink-0 font-mono">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-text-secondary">{step.title}</p>
                <p className="mt-0.5 break-words">
                  {step.body}
                  {step.code && (
                    <code className="font-mono text-text-primary bg-surface-800 border border-border-subtle px-1.5 py-0.5 rounded dir-ltr inline-block mt-1 break-all">
                      {step.code}
                    </code>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*--------------|| QR Code Printing Guidelines ||--------------*/}
      <div className="surface p-4 sm:p-6 rounded-2xl shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
          <QrCode className="w-4 h-4 text-status-active-icon shrink-0" />
          <span>طباعة رموز QR Code</span>
        </h3>
        <p className="text-xs text-text-muted leading-relaxed">
          من قائمة الكروت، اضغط على أيقونة QR لأي كارت. ستتمكن من تحميل رمز PNG
          عالي الدقة (300 DPI بدقة H لأعلى تصحيح أخطاء)، أو طباعة بطاقة العرض
          المباشرة المناسبة للمطاعم والمكاتب والمحلات التجارية.
        </p>
      </div>
    </div>
  );
};
