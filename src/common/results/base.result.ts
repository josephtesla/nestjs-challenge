import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseResult {
  @ApiProperty({ enum: HttpStatus })
  statusCode: HttpStatus;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ example: 130 })
  totalDocuments?: number;

  @ApiPropertyOptional({ example: 13 })
  totalPages?: number;

  @ApiPropertyOptional({ example: 2 })
  currentPage?: number;

  @ApiPropertyOptional({ example: 10 })
  limit?: number;

  constructor(
    statusCode: HttpStatus,
    message: string,
    totalDocuments?: number,
    limit?: number,
    offset?: number,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    if (totalDocuments !== undefined) {
      // include pagination details
      this.totalDocuments = totalDocuments;
      this.limit = limit;
      if (limit > 0) {
        this.totalPages = Math.ceil(totalDocuments / limit);
        this.currentPage = Math.floor(offset / limit) + 1; // page starts at 1
      }
    }
  }
}
