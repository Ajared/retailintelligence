import ListGenericRecord from '~/types/generic/list-record.type';

interface StateFilterOptions {
  name?: string;
}

type ListStateRecordOptions = ListGenericRecord<StateFilterOptions>;

export default ListStateRecordOptions;
