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
    heroTitle: "Dynamic Review Cards",
    heroDesc:
      "اربط كروت التقييم الثابتة بروالمتغيرة Google Review في أي وقت، دون الحاجة لإعادة طباعة الكارت أو برمجته مجدداً.",
    goToDashboard: "الدخول إلى لوحة التحكم",
    createAccount: "إنشاء حساب جديد",

    //--------------|| Live Demo Simulator ||--------------//
    demoTitle: "شاهد ماذا يحدث عند مسح الكارت",
    demoDesc:
      "اختر إحدى الوجهات بالأسفل، وسيتغيّر محتوى شاشة الهاتف مباشرة كما يراه العميل.",
    demoActionLabel: "ما يفعله الكارت عند المس",
    demoInstagram: "حساب الإنستغرام (Instagram)",
    demoWhatsapp: "محادثة الواتساب (WhatsApp)",
    demoBioLink: "صفحة روابط مخصصة (Custom Bio Link)",
    demoActionInstagram: "يفتح حساب @sadeq.cafe مباشرة على تطبيق إنستغرام",
    demoActionWhatsapp:
      "يفتح محادثة واتساب مباشرة مع رقم الكارت لتأكيد الحجز فوراً",
    demoActionBio: "يفتح صفحة الروابط المخصصة التي تجمع كل قنوات التواصل",
    demoTapHint: "المس البطاقة",
    demoCardTag: "كارت NFC ديناميكي",
    demoCta: "ابدأ الآن وأنظّم كروتك",

    //--------------|| Simulator: Instagram screen ||--------------//
    demoIgBio: "قهوة مختصة • الرياض",
    demoIgPosts: "منشور",
    demoIgFollowers: "متابع",
    demoIgFollowing: "يتابع",
    demoIgFollow: "متابعة",

    //--------------|| Simulator: WhatsApp screen ||--------------//
    demoWaName: "مقهى سَعد",
    demoWaOnline: "متصل الآن",
    demoWaMsg1: "أهلاً بك! كيف نساعدك اليوم؟",
    demoWaMsg2: "أود حجز طاولة لشخصين",
    demoWaPlaceholder: "اكتب رسالة...",

    //--------------|| Simulator: Bio link screen ||--------------//
    demoBioTitle: "روابطنا الرسمية",
    demoBioMenu: "قائمة الطعام",
    demoBioReserve: "احجز طاولة",
    demoBioReviews: "تقييمات العملاء",

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
    heroTitle: "Dynamic Review Cards",
    heroDesc:
      "Link fixed review cards to dynamic Google Review URLs at any time, without reprint or reprogramming.",
    goToDashboard: "Go to Dashboard",
    createAccount: "Create a new account",

    //--------------|| Live Demo Simulator ||--------------//
    demoTitle: "See what happens when the card is tapped",
    demoDesc:
      "Pick a destination below and the phone screen updates instantly, exactly as the customer sees it.",
    demoActionLabel: "What the card does on tap",
    demoInstagram: "Instagram profile",
    demoWhatsapp: "WhatsApp chat",
    demoBioLink: "Custom bio link page",
    demoActionInstagram: "Opens @sadeq.cafe directly in the Instagram app",
    demoActionWhatsapp:
      "Opens a direct WhatsApp chat with the card's number to confirm a booking",
    demoActionBio: "Opens the custom bio page that gathers every contact channel",
    demoTapHint: "Tap the card",
    demoCardTag: "Dynamic NFC Card",
    demoCta: "Start now and organize your cards",

    //--------------|| Simulator: Instagram screen ||--------------//
    demoIgBio: "Specialty coffee • Riyadh",
    demoIgPosts: "posts",
    demoIgFollowers: "followers",
    demoIgFollowing: "following",
    demoIgFollow: "Follow",

    //--------------|| Simulator: WhatsApp screen ||--------------//
    demoWaName: "Saad Coffee",
    demoWaOnline: "online",
    demoWaMsg1: "Hi there! How can we help?",
    demoWaMsg2: "I'd like to book a table for two",
    demoWaPlaceholder: "Type a message",

    //--------------|| Simulator: Bio link screen ||--------------//
    demoBioTitle: "Our official links",
    demoBioMenu: "Menu",
    demoBioReserve: "Book a table",
    demoBioReviews: "Customer reviews",

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
