import ListGenericRecord from '~/types/generic/list-record.type';

interface StoreFilterOptions {
  name?: string;
  localGovernmentId?: string;
  stateId?: string;
  storeType?: string;
  enumeratorId?: string;
}

type ListStoreRecordOptions = ListGenericRecord<StoreFilterOptions>;

export default ListStoreRecordOptions;
