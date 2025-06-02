export const RecordMessages = {
  SUCCESS: {
    RECORD_CREATED_SUCCESSFULLY: 'Record created successfully',
    RECORD_UPDATED_SUCCESSFULLY: 'Record updated successfully',
    RECORD_DELETED_SUCCESSFULLY: 'Record deleted successfully',
    RECORD_FETCHED_SUCCESSFULLY: 'Record(s) fetched successfully',
  },
  FAILURE: {
    RECORD_EXISTS: 'Record with this artist/album/format already exists',
    RECORD_NOT_FOUND: 'Record not found',
    INSUFFICIENT_STOCK: 'Insufficient stock for requested quantity',
  },
  INFO: {
    NO_RECORDS_AVAILABLE: 'No records available',
  },
} as const;
