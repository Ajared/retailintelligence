import { DistrictInterface } from './district.interface';
import CreateGenericRecord from '~/types/generic/create-record.type';

type CreateDistrictRecordPayload = Partial<DistrictInterface>;
type CreateDistrictRecordOptions =
  CreateGenericRecord<CreateDistrictRecordPayload>;

export default CreateDistrictRecordOptions;
