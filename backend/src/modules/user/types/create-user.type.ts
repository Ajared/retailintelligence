import { UserInterface } from './user.interface';
import CreateGenericRecord from '~/types/generic/create-record.type';

type CreateUserRecordPayload = Partial<UserInterface>;
type CreateUserRecordOptions = CreateGenericRecord<CreateUserRecordPayload>;

export default CreateUserRecordOptions;
