import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { ConfirmEmailPage } from "./pages/auth/ConfirmEmailPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { UserDashboardPage } from "./pages/user/UserDashboardPage";
import { ScanRedirectPage } from "./pages/ScanRedirectPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";

function UserDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <UserDashboardPage
      onLogout={async () => {
        await logout();
        navigate("/admin/login");
      }}
      dbMode="supabase"
      currentUser={user}
    />
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Routes>
      {/* Dynamic NFC/QR Code Scan Redirect */}
      <Route path="/r/:cardId" element={<ScanRedirectPage />} />

      {/* Public Home Page */}
      <Route
        path="/"
        element={
          <HomePage
            onGoToLogin={() => navigate("/admin/login")}
            onGoToSignUp={() => navigate("/signup")}
            onGoToDashboard={() => {
              if (user?.role === "admin") {
                navigate("/admin");
              } else {
                navigate("/user");
              }
            }}
            isAuthenticated={isAuthenticated}
          />
        }
      />

      {/* Standalone Signup Page (deep-linked from the landing page CTA) */}
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === "admin" ? "/admin" : "/user"}
              replace
            />
          ) : (
            <LoginPage
              initialMode="signup"
              onLoginSuccess={(_token, loggedInUser) => {
                if (loggedInUser.role === "admin") {
                  navigate("/admin");
                } else {
                  navigate("/user");
                }
              }}
              onGoHome={() => navigate("/")}
              dbMode="supabase"
            />
          )
        }
      />

      {/* Login / Signup Page */}
      <Route
        path="/admin/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === "admin" ? "/admin" : "/user"}
              replace
            />
          ) : (
            <LoginPage
              onLoginSuccess={(_token, loggedInUser) => {
                if (loggedInUser.role === "admin") {
                  navigate("/admin");
                } else {
                  navigate("/user");
                }
              }}
              onGoHome={() => navigate("/")}
              dbMode="supabase"
            />
          )
        }
      />

      {/* Post-registration e-mail confirmation notice (public) */}
      <Route
        path="/auth/confirm-email"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === "admin" ? "/admin" : "/user"}
              replace
            />
          ) : (
            <ConfirmEmailPage
              onGoToLogin={() => navigate("/admin/login")}
              onGoHome={() => navigate("/")}
            />
          )
        }
      />

      {/* Protected Admin Dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage
              onLogout={async () => {
                await logout();
                navigate("/admin/login");
              }}
              dbMode="supabase"
              currentUser={user}
            />
          </ProtectedRoute>
        }
      />

      {/* Protected User Dashboard */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
