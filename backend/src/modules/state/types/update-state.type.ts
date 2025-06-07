import { StateInterface } from './state.interface';
import UpdateGenericRecord from '~/types/generic/update-record.type';
type UpdateStateRecordPayload = Partial<StateInterface>;
type UpdateStateRecordOptions = UpdateGenericRecord<
  UpdateStateRecordPayload,
  Record<string, unknown>
>;

export { UpdateStateRecordOptions };
