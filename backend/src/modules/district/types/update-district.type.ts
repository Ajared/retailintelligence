import { DistrictInterface } from './district.interface';
import UpdateGenericRecord from '~/types/generic/update-record.type';
type UpdateDistrictRecordPayload = Partial<DistrictInterface>;
type UpdateDistrictRecordOptions = UpdateGenericRecord<
  UpdateDistrictRecordPayload,
  Record<string, unknown>
>;

export default UpdateDistrictRecordOptions;
