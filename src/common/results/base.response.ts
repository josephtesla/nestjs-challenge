import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseResponse<T = unknown> {
  @ApiProperty({ enum: HttpStatus })
  statusCode: HttpStatus;

  @ApiProperty()
  message: string;

  @ApiProperty({ description: 'Payload for the response' })
  data: T;

  @ApiPropertyOptional({ example: 130 })
  totalDocuments?: number;

  @ApiPropertyOptional({ example: 13 })
  totalPages?: number;

  @ApiPropertyOptional({ example: 2 })
  currentPage?: number;

  @ApiPropertyOptional({ example: 10 })
  limit?: number;

  constructor(params: {
    data: T;
    statusCode: HttpStatus;
    message: string;
    totalDocuments?: number;
    limit?: number;
    offset?: number;
  }) {
    const { statusCode, message, data, totalDocuments, limit, offset } = params;

    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (totalDocuments !== undefined) {
      this.totalDocuments = totalDocuments;
      this.limit = limit;
      if (limit && limit > 0) {
        this.totalPages = Math.ceil(totalDocuments / limit);
        this.currentPage = Math.floor((offset ?? 0) / limit) + 1;
      }
    }
  }
}
