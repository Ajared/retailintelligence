import ListGenericRecord from '~/types/generic/list-record.type';
import { FilterOptions, PaginationOptions } from '~/helpers/query.helper';

interface StateFilterOptions extends FilterOptions {
  name?: string;
}
interface StateQueryOptions extends StateFilterOptions, PaginationOptions {}
type ListStateRecordOptions = ListGenericRecord<StateFilterOptions>;

export { ListStateRecordOptions, StateFilterOptions, StateQueryOptions };
