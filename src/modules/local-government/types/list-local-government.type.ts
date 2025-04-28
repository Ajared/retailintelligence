import ListGenericRecord from '~/types/generic/list-record.type';

interface LocalGovernmentFilterOptions {
  name?: string;
}

type ListLocalGovernmentRecordOptions =
  ListGenericRecord<LocalGovernmentFilterOptions>;

export default ListLocalGovernmentRecordOptions;
