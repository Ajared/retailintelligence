import { UserInterface } from './user.interface';
import UpdateGenericRecord from '~/types/generic/update-record.type';
type UpdateUserRecordPayload = Partial<UserInterface>;
type UpdateUserRecordOptions = UpdateGenericRecord<
  UpdateUserRecordPayload,
  Record<string, unknown>
>;

export default UpdateUserRecordOptions;
