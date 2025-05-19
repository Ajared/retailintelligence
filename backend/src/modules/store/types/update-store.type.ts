import { StoreInterface } from './store.interface';
import UpdateGenericRecord from '~/types/generic/update-record.type';
type UpdateStoreRecordPayload = Partial<StoreInterface>;
type UpdateStoreRecordOptions = UpdateGenericRecord<
  UpdateStoreRecordPayload,
  Record<string, unknown>
>;

export default UpdateStoreRecordOptions;
