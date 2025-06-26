import ListGenericRecord from '~/types/generic/list-record.type';
import { FilterOptions, PaginationOptions } from '~/helpers/query.helper';

interface PhaseFilterOptions extends FilterOptions {
  name?: string;
}
interface PhaseQueryOptions extends PhaseFilterOptions, PaginationOptions {}
type ListPhaseRecordOptions = ListGenericRecord<PhaseFilterOptions>;

export { ListPhaseRecordOptions, PhaseFilterOptions, PhaseQueryOptions };
