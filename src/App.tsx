import React, { useState, useEffect } from "react";
import { ToastProvider } from "./components/ui/Toast";
import { HomePage } from "./components/pages/HomePage";
import { LoginPage } from "./components/pages/LoginPage";
import { AdminDashboardPage } from "./components/pages/AdminDashboardPage";
import { supabase } from "./lib/fetchUtils";

//--------------|| Main Application Root Component ||--------------//
export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || "/";
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem("review_cards_token") || "demo_token";
  });

  const [dbMode, setDbMode] = useState<"supabase" | "mock">("supabase");
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  //--------------|| Dynamic QR/NFC Redirect Handler (/r/:cardId) ||--------------//
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/r/")) {
      const cardId = path.split("/r/")[1]?.trim();
      if (cardId) {
        setRedirecting(true);

        const handleRedirect = async () => {
          try {
            //--------------|| Fetch Card Details from Supabase ||--------------//
            const { data, error } = await supabase
              .from("cards")
              .select("target_url, is_active, scan_count")
              .eq("card_id", cardId)
              .single();

            if (error || !data) {
              setRedirectError("عذراً، هذا الكارت غير موجود في النظام.");
              setRedirecting(false);
              return;
            }

            if (!data.is_active) {
              setRedirectError("عذراً، هذا الكارت غير مفعل حالياً.");
              setRedirecting(false);
              return;
            }

            if (!data.target_url) {
              setRedirectError("لم يتم ربط رابط توجيه لهذا الكارت بعد.");
              setRedirecting(false);
              return;
            }

            //--------------|| Increment Scan Counter ||--------------//
            await supabase
              .from("cards")
              .update({
                scan_count: (data.scan_count || 0) + 1,
                last_scanned_at: new Date().toISOString(),
              })
              .eq("card_id", cardId);

            //--------------|| Enforce Valid Absolute URL Protocol ||--------------//
            const finalUrl =
              data.target_url.startsWith("http://") ||
              data.target_url.startsWith("https://")
                ? data.target_url
                : `https://${data.target_url}`;

            //--------------|| Instant Redirect Execution ||--------------//
            window.location.href = finalUrl;
          } catch (err) {
            setRedirectError("حدث خطأ أثناء الاتصال بقاعدة البيانات.");
            setRedirecting(false);
          }
        };

        handleRedirect();
      }
    }
  }, []);

  //--------------|| History PopState Listener ||--------------//
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  //--------------|| Navigation & Authentication Handlers ||--------------//
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const handleLoginSuccess = (token: string, user: any) => {
    setAuthToken(token);
    localStorage.setItem("review_cards_token", token);
    navigateTo("/admin");
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem("review_cards_token");
    navigateTo("/admin/login");
  };

  const isAuthenticated = Boolean(authToken);

  //--------------|| Render Dynamic Scan Redirect Screen ||--------------//
  if (currentPath.startsWith("/r/")) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 dir-rtl text-center">
        {redirectError ? (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-100">تعذر التوجيه</h2>
            <p className="text-sm text-slate-400">{redirectError}</p>
            {/* <button
              onClick={() => navigateTo("/")}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition"
            >
              العودة للرئيسية
            </button> */}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-medium">
              جاري توجيهك إلى صفحة التقييم...
            </p>
          </div>
        )}
      </div>
    );
  }

  //--------------|| Application Route Matching Logic ||--------------//
  let content = null;

  if (currentPath.startsWith("/admin/login")) {
    content = (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoHome={() => navigateTo("/")}
        dbMode={dbMode}
      />
    );
  } else if (currentPath.startsWith("/admin")) {
    if (!isAuthenticated) {
      content = (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGoHome={() => navigateTo("/")}
          dbMode={dbMode}
        />
      );
    } else {
      content = (
        <AdminDashboardPage onLogout={handleLogout} dbMode="supabase" />
      );
    }
  } else {
    content = (
      <HomePage
        onGoToLogin={() => navigateTo("/admin/login")}
        onGoToDashboard={() => navigateTo("/admin")}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return <ToastProvider>{content}</ToastProvider>;
}
