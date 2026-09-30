import type { UserRole, UserProfile, AuthUser } from "./card";

export type { UserRole, UserProfile, AuthUser };

export interface UserUpdateData {
  username?: string;
  email?: string;
}
