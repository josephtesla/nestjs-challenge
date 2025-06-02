import { RecordCategory, RecordFormat } from '../schemas/record.enum';

export interface SearchOptions {
  q?: string;
  artist?: string;
  album?: string;
  format?: RecordFormat;
  category?: RecordCategory;
  limit?: number;
  offset?: number;
}
