import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase/client";
import type { AuthUser } from "../types";
import {
  loginWithIdentifier,
  signUpUser,
  logoutUser,
  getUserProfile,
} from "../features/auth/services/authService";
import type { LoginCredentials, SignUpCredentials } from "../features/auth/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("review_cards_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem("review_cards_token") || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state to localStorage
  const syncAuthState = (newUser: AuthUser | null, token: string | null) => {
    setUser(newUser);
    setSessionToken(token);
    if (newUser && token) {
      localStorage.setItem("review_cards_token", token);
      localStorage.setItem("review_cards_current_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("review_cards_token");
      localStorage.removeItem("review_cards_current_user");
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        const refreshedUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          username: profile?.username || undefined,
          role: profile?.role || "user",
          token: session.access_token,
        };
        syncAuthState(refreshedUser, session.access_token);
      } else {
        syncAuthState(null, null);
      }
    } catch (err) {
      console.warn("Failed to refresh user session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for Supabase auth events
  useEffect(() => {
    refreshUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          syncAuthState(null, null);
          setIsLoading(false);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const profile = await getUserProfile(session.user.id);
          const activeUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || "",
            username: profile?.username || undefined,
            role: profile?.role || "user",
            token: session.access_token,
          };
          syncAuthState(activeUser, session.access_token);
          setIsLoading(false);
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, token } = await loginWithIdentifier(credentials);
      syncAuthState(loggedInUser, token);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    setIsLoading(true);
    try {
      await signUpUser(credentials);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      syncAuthState(null, null);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = Boolean(user && sessionToken);
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        signUp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
