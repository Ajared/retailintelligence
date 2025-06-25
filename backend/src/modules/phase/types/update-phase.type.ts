import { PhaseInterface } from './phase.interface';
import UpdateGenericRecord from '~/types/generic/update-record.type';
type UpdatePhaseRecordPayload = Partial<PhaseInterface>;
type UpdatePhaseRecordOptions = UpdateGenericRecord<
  UpdatePhaseRecordPayload,
  Record<string, unknown>
>;

export { UpdatePhaseRecordOptions };
