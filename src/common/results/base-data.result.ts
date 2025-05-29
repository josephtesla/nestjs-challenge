import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResult } from './base.result';

export class BaseResultWithData<T = unknown> extends BaseResult {
  @ApiProperty({ description: 'Payload for the response' })
  data: T;

  constructor(
    statusCode: HttpStatus,
    message: string,
    data: T,
    totalDocuments?: number,
    limit?: number,
    offset?: number,
  ) {
    super(statusCode, message, totalDocuments, limit, offset);
    this.data = data;
  }
}
