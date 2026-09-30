import type { AuthUser, UserProfile } from "../../../types";

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface SignUpCredentials {
  email: string;
  username: string;
  password: string;
}

export interface SignUpResult {
  email: string;
  // Supabase only returns a session when the project has "Confirm email"
  // turned OFF. No session => the account exists but cannot sign in yet.
  requiresEmailConfirmation: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
