import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../../../common/results';
import { RecordEntity, RecordMessages } from '.';

export class RecordsPaginatedResponse extends BaseResponse<RecordEntity[]> {
  @ApiProperty({ type: () => RecordEntity, isArray: true })
  data: RecordEntity[];

  constructor(params: {
    data: any;
    statusCode: HttpStatus;
    message: string;
    totalDocuments?: number;
    limit?: number;
    offset?: number;
  }) {
    super(params);
  }

  static get(params: { data: any; totalDocuments: number; limit: number; offset: number }) {
    return new RecordsPaginatedResponse({
      statusCode: HttpStatus.OK,
      message: RecordMessages.SUCCESS.RECORD_FETCHED_SUCCESSFULLY,
      data: params.data,
      totalDocuments: params.totalDocuments,
      limit: params.limit,
      offset: params.offset,
    });
  }
}
