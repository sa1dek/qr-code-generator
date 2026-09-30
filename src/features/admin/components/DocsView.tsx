import React from "react";
import { Smartphone, QrCode, Cpu } from "lucide-react";
import { getBaseAppUrl } from "../../../utils/utils";

//--------------|| Documentation View Component ||--------------//
export const DocsView: React.FC = () => {
  const origin = getBaseAppUrl();

  return (
    <div className="space-y-6 max-w-4xl text-right" dir="rtl">
      {/*--------------|| Page Header ||--------------*/}
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          دليل برمجة واستخدام كروت NFC و QR الديناميكية
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          شرح متكامل لكيفية برمجة الشرائح وطباعة الرموز وإعادة توجيهها
          ديناميكياً دون لمس الكارت الفعلي.
        </p>
      </div>

      {/*--------------|| Dynamic Core Architecture Box ||--------------*/}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-700" />
          <span>القاعدة الذهبية للنظام (The Dynamic Core)</span>
        </h3>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 space-y-2 dir-ltr text-left">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span>NFC Card / QR Code</span>
            <span>&rarr;</span>
            <span className="text-blue-600">{origin}/r/CARD-001</span>
          </div>
          <div className="pl-6 text-slate-500">
            &darr; (Database lookup &amp; Scan Counter)
          </div>
          <div className="flex items-center gap-2 font-bold text-emerald-700">
            <span>HTTP 302 Redirect</span>
            <span>&rarr;</span>
            <span className="text-emerald-600">
              https://search.google.com/local/writereview?placeid=...
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>السر في النظام:</strong> يتم حرق أو طباعة الرابط الثابت{" "}
          <code className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{`${origin}/r/CARD-XXX`}</code>{" "}
          فقط على الكارت. عندما يقوم العميل بتغيير فرع المطعم أو تحديث رابط
          التقييم الخاص به على Google، يتم تعديل الرابط في لوحة التحكم بضغطة زر،
          ويعمل الكارت فوراً بالرابط الجديد دون الحاجة لإعادة طباعته أو إعادة
          برمجته!
        </p>
      </div>

      {/*--------------|| NFC Programming Steps ||--------------*/}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>طريقة برمجة كارت NFC (باستخدام شريحة NTAG213 / NTAG215)</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="font-bold text-slate-800">تحميل تطبيق NFC Tools</p>
              <p className="text-slate-500 mt-0.5">
                التطبيق مجاني على كل من iOS (App Store) و Android (Google Play).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="font-bold text-slate-800">
                نسخ رابط الكارت المختصر من لوحة التحكم
              </p>
              <p className="text-slate-500 mt-0.5">
                اضغط على زر النسخ بجوار الكارت، ستحصل على رابط مثل:{" "}
                <code className="font-mono text-slate-800 dir-ltr inline-block">{`${origin}/r/CARD-001`}</code>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="font-bold text-slate-800">
                كتابة الرابط في الشريحة (Write URI)
              </p>
              <p className="text-slate-500 mt-0.5">
                في تطبيق NFC Tools، اختر{" "}
                <strong>
                  Write &rarr; Add a record &rarr; Custom URL / URI
                </strong>
                ، ثم الصق الرابط واضغط <strong>Write</strong> ومرر الكارت خلف
                الهاتف.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <p className="font-bold text-slate-800">
                حماية الشريحة (اختياري)
              </p>
              <p className="text-slate-500 mt-0.5">
                يمكنك قفل الشريحة (Lock) لمنع أي شخص من الكتابة عليها، والرابط
                سيظل قابلاً للتحديث دوماً عبر لوحة التحكم الخاصة بك.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/*--------------|| QR Code Printing Guidelines ||--------------*/}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-600" />
          <span>طباعة رموز QR Code</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          من قائمة الكروت، اضغط على أيقونة QR لأي كارت. ستتمكن من تحميل رمز PNG
          عالي الدقة (300 DPI بدقة H لأعلى تصحيح أخطاء)، أو طباعة بطاقة العرض
          المباشرة المناسبة للمطاعم والمكاتب والمحلات التجارية.
        </p>
      </div>
    </div>
  );
};
