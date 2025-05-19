interface ListGenericRecord<FilterRecordOptions> {
  filterRecordOptions: FilterRecordOptions;
  relations?: object;
  paginationPayload?: {
    limit: number;
    page: number;
  };
}

export default ListGenericRecord;
