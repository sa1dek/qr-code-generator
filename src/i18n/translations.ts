//--------------|| Language Types ||--------------//
export type Language = "ar" | "en";

//--------------|| Translations Dictionary ||--------------//
export const translations = {
  ar: {
    //--------------|| Header & Nav ||--------------//
    dashboard: "لوحة التحكم",
    login: "تسجيل الدخول",
    subtitle: "نظام كروت NFC و QR التفاعلية",

    //--------------|| Hero Section ||--------------//
    instantRedirect: "توجيه فوري بدون إعادة برمجية الكارت",
    heroTitle: "Dynamic Review Cards",
    heroDesc:
      "اربط كروت التقييم الثابتة بروالمتغيرة Google Review في أي وقت، دون الحاجة لإعادة طباعة الكارت أو برمجته مجدداً.",
    goToDashboard: "الدخول إلى لوحة التحكم",
    testActiveCard: "تجربة مسح كارت نشط (/r/CARD-001)",

    //--------------|| Quick Redirect Tester ||--------------//
    testerTitle: "تجربة فاحص الروابط الديناميكية (Quick Redirect Tester)",
    testerDesc:
      "جرب كتابة أي معرف كارت لمعرفة كيفية استجابة النظام (نشط، غير مخصص، أو غير موجود):",
    testButton: "اختبار التوجيه",
    quickSamples: "نماذج سريعة:",

    //--------------|| Features Grid ||--------------//
    nfcSupportTitle: "دعم كامل لـ NFC",
    nfcSupportDesc:
      "كارت مبرمج بعنوان ثابت يوجه تلقائياً إلى رابط تقييم العميل على هواتف Android و iOS.",
    qrGenTitle: "مولد QR Code ديناميكي",
    qrGenDesc:
      "توليد وطباعة وتنزيل رموز QR عالية الدقة تشير إلى المعرف المتجدد.",
    analyticsTitle: "خصوصية وتحليلات مسح",
    analyticsDesc:
      "إحصائيات تفصيلية لعدد المسحات مع تشفير وإخفاء عناوين IP احتراماً للخصوصية.",
  },
  en: {
    //--------------|| Header & Nav ||--------------//
    dashboard: "Dashboard",
    login: "Login",
    subtitle: "Interactive NFC & QR Review System",

    //--------------|| Hero Section ||--------------//
    instantRedirect: "Instant Redirect Without Reprogramming",
    heroTitle: "Dynamic Review Cards",
    heroDesc:
      "Link fixed review cards to dynamic Google Review URLs at any time, without reprint or reprogramming.",
    goToDashboard: "Go to Dashboard",
    testActiveCard: "Test Active Card (/r/CARD-001)",

    //--------------|| Quick Redirect Tester ||--------------//
    testerTitle: "Quick Redirect Tester",
    testerDesc:
      "Enter any card ID to test system response (Active, Unassigned, or Not Found):",
    testButton: "Test Redirect",
    quickSamples: "Quick Samples:",

    //--------------|| Features Grid ||--------------//
    nfcSupportTitle: "Full NFC Support",
    nfcSupportDesc:
      "Pre-programmed NFC chips redirecting automatically on Android & iOS devices.",
    qrGenTitle: "Dynamic QR Generator",
    qrGenDesc:
      "Generate, print, and download high-resolution dynamic QR codes.",
    analyticsTitle: "Analytics & Privacy",
    analyticsDesc:
      "Detailed scan analytics with IP encryption to maintain complete privacy.",
  },
};
