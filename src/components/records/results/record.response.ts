import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../../../common/results';
import { RecordMessages } from '.';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';

export class RecordEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artist: string;

  @ApiProperty()
  album: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  qty: number;

  @ApiProperty()
  format: RecordFormat;

  @ApiProperty()
  category: RecordCategory;

  @ApiPropertyOptional()
  mbid?: string;

  @ApiProperty()
  tracklist: string[];

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class RecordResponse extends BaseResponse<RecordEntity> {
  @ApiProperty({ type: () => RecordEntity })
  data: RecordEntity;

  constructor(params: { statusCode: HttpStatus; message: string; data: any }) {
    super(params);
  }

  static created(data: any) {
    return new RecordResponse({
      statusCode: HttpStatus.CREATED,
      message: RecordMessages.SUCCESS.RECORD_CREATED_SUCCESSFULLY,
      data,
    });
  }

  static updated(data: any) {
    return new RecordResponse({
      statusCode: HttpStatus.OK,
      message: RecordMessages.SUCCESS.RECORD_UPDATED_SUCCESSFULLY,
      data,
    });
  }
}
