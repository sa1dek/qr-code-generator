import type { AuthUser, UserRole, UserProfile } from "../../../types";

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface SignUpCredentials {
  email: string;
  username: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
