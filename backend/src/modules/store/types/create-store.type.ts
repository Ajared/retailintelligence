import { StoreInterface } from './store.interface';
import CreateGenericRecord from '~/types/generic/create-record.type';

type CreateStoreRecordPayload = Partial<StoreInterface>;
type CreateStoreRecordOptions = CreateGenericRecord<CreateStoreRecordPayload>;

export default CreateStoreRecordOptions;
