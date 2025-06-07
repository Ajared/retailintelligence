import ListGenericRecord from '~/types/generic/list-record.type';
import { FilterOptions, PaginationOptions } from '~/helpers/query.helper';

interface LocalGovernmentFilterOptions extends FilterOptions {
  name?: string;
  stateId?: string;
}

interface LocalGovernmentQueryOptions
  extends LocalGovernmentFilterOptions,
    PaginationOptions {}
type ListLocalGovernmentRecordOptions =
  ListGenericRecord<LocalGovernmentFilterOptions>;

export {
  ListLocalGovernmentRecordOptions,
  LocalGovernmentFilterOptions,
  LocalGovernmentQueryOptions,
};
