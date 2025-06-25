import { PhaseInterface } from './phase.interface';
import CreateGenericRecord from '~/types/generic/create-record.type';

type CreatePhaseRecordPayload = Partial<PhaseInterface>;
type CreatePhaseRecordOptions = CreateGenericRecord<CreatePhaseRecordPayload>;

export { CreatePhaseRecordOptions };
