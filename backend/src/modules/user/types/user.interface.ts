import { AuthProvider } from '~/modules/auth/constants/auth.constant';
import { AbstractBaseInterface } from '~/database/base/base.interface';
import { UserRole, UserStatus } from '~/modules/user/constants/user.constant';

export interface UserInterface extends AbstractBaseInterface {
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  authProvider: AuthProvider;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  assignedStateId?: string;
  assignedLocalGovernmentId?: string;
  assignedPhaseId?: string;
  assignedDistrictId?: string;
}
