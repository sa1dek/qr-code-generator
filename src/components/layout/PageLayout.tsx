import React from "react";
import { Navbar } from "./Navbar";
import type { AuthUser } from "../../types/card";

interface PageLayoutProps {
  children: React.ReactNode;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onGoToLogin?: () => void;
  onGoToDashboard?: () => void;
  showHeader?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  currentUser,
  onLogout,
  onGoToLogin,
  onGoToDashboard,
  showHeader = true,
}) => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col overflow-x-hidden">
      {showHeader && (
        <Navbar
          currentUser={currentUser}
          onLogout={onLogout}
          onGoToLogin={onGoToLogin}
          onGoToDashboard={onGoToDashboard}
        />
      )}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};