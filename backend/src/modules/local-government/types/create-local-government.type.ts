import { LocalGovernmentInterface } from './local-government.interface';
import CreateGenericRecord from '~/types/generic/create-record.type';

type CreateLocalGovernmentRecordPayload = Partial<LocalGovernmentInterface>;
type CreateLocalGovernmentRecordOptions =
  CreateGenericRecord<CreateLocalGovernmentRecordPayload>;

export default CreateLocalGovernmentRecordOptions;
