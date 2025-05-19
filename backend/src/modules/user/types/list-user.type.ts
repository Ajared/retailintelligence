import ListGenericRecord from '~/types/generic/list-record.type';

interface UserFilterOptions {
  email?: string;
  authProvider?: string;
  isEmailVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

type ListUserRecordOptions = ListGenericRecord<UserFilterOptions>;

export default ListUserRecordOptions;
