import { AbstractBaseInterface } from './base';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export interface UserInterface extends AbstractBaseInterface {
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  auth_provider: AuthProvider;
  reset_password_token?: string;
  reset_password_expires?: Date | string;
  deactivated_at?: Date | string | null;
  assigned_state_id?: string;
  assigned_local_government_id?: string;
  assigned_phase_id?: string;
  assigned_district_id?: string;
}
