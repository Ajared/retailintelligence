import { StateInterface } from './state.interface';
import CreateGenericRecord from '~/types/generic/create-record.type';

type CreateStateRecordPayload = Partial<StateInterface>;
type CreateStateRecordOptions = CreateGenericRecord<CreateStateRecordPayload>;

export { CreateStateRecordOptions };
