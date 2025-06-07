interface ListGenericRecord<FilterRecordOptions> {
  filterRecordOptions: FilterRecordOptions | undefined;
  relations?: object;
  paginationPayload?: {
    limit: number;
    page: number;
  };
}

export default ListGenericRecord;
