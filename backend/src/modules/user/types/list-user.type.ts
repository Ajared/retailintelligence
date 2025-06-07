import ListGenericRecord from '~/types/generic/list-record.type';
import { FilterOptions, PaginationOptions } from '~/helpers/query.helper';
import { AuthProvider } from '~/modules/auth/constants/auth.constant';
import { UserRole, UserStatus } from '../constants/user.constant';

interface UserFilterOptions extends FilterOptions {
  email?: string;
  authProvider?: AuthProvider;
  role?: UserRole;
  status?: UserStatus;
}

interface UserQueryOptions extends UserFilterOptions, PaginationOptions {}
type ListUserRecordOptions = ListGenericRecord<UserFilterOptions>;

export { ListUserRecordOptions, UserFilterOptions, UserQueryOptions };
