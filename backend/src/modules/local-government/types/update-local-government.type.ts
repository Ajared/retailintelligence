import { LocalGovernmentInterface } from './local-government.interface';
import UpdateGenericRecord from '~/types/generic/update-record.type';

type UpdateLocalGovernmentRecordPayload = Partial<LocalGovernmentInterface>;
type UpdateLocalGovernmentRecordOptions = UpdateGenericRecord<
  UpdateLocalGovernmentRecordPayload,
  Record<string, unknown>
>;

export default UpdateLocalGovernmentRecordOptions;
