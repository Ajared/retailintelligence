import { StoreType } from './store.interface';
import ListGenericRecord from '~/types/generic/list-record.type';
import { FilterOptions, PaginationOptions } from '~/helpers/query.helper';

interface StoreFilterOptions extends FilterOptions {
  name?: string;
  stateId?: string;
  enumeratorId?: string;
  localGovernmentId?: string;
  phaseId?: string;
  districtId?: string;
  storeType?: StoreType;
  minLat?: `${number}`;
  maxLat?: `${number}`;
  minLng?: `${number}`;
  maxLng?: `${number}`;
}

interface StoreQueryOptions extends StoreFilterOptions, PaginationOptions {}
type ListStoreRecordOptions = ListGenericRecord<StoreFilterOptions>;

export { StoreQueryOptions, StoreFilterOptions, ListStoreRecordOptions };
