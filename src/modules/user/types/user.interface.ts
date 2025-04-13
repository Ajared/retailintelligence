import { AuthProvider } from '~/modules/auth/constants/auth.constant';
import { AbstractBaseInterface } from '~/database/base/base.interface';
export interface UserInterface extends AbstractBaseInterface {
  email: string;
  password: string;
  authProvider: AuthProvider;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}
