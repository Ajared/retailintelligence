import ListGenericRecord from '~/types/generic/list-record.type';
import { FilterOptions, PaginationOptions } from '~/helpers/query.helper';

interface DistrictFilterOptions extends FilterOptions {
  name?: string;
  phaseId?: string;
}

interface DistrictQueryOptions
  extends DistrictFilterOptions,
    PaginationOptions {}
type ListDistrictRecordOptions = ListGenericRecord<DistrictFilterOptions>;

export {
  ListDistrictRecordOptions,
  DistrictFilterOptions,
  DistrictQueryOptions,
};
