import ListGenericRecord from '~/types/generic/list-record.type';

interface DistrictFilterOptions {
  name?: string;
}

type ListDistrictRecordOptions = ListGenericRecord<DistrictFilterOptions>;

export default ListDistrictRecordOptions;
