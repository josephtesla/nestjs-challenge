import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResultWithData } from '../../../common/results';
import { RecordEntity, RecordMessages } from '.';

export class RecordsPaginatedResponse extends BaseResultWithData<RecordEntity[]> {
  @ApiProperty({ type: () => RecordEntity, isArray: true })
  data: RecordEntity[];

  constructor(
    data: RecordEntity[],
    totalDocuments: number,
    limit: number,
    offset: number,
    message = RecordMessages.SUCCESS.RECORD_FETCHED_SUCCESSFULLY,
    status: HttpStatus = HttpStatus.OK,
  ) {
    super(status, message, data, totalDocuments, limit, offset);
  }
}
