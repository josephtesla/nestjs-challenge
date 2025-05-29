import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResultWithData } from '../../../common/results';
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
}

export class RecordResponse extends BaseResultWithData<RecordEntity> {
  @ApiProperty({ type: () => RecordEntity })
  data: RecordEntity;

  constructor(data: RecordEntity, message: string, status: HttpStatus) {
    super(status, message, data);
  }

  static created(data: RecordEntity) {
    return new RecordResponse(
      data,
      RecordMessages.SUCCESS.RECORD_CREATED_SUCCESSFULLY,
      HttpStatus.CREATED,
    );
  }

  static updated(data: RecordEntity) {
    return new RecordResponse(
      data,
      RecordMessages.SUCCESS.RECORD_UPDATED_SUCCESSFULLY,
      HttpStatus.OK,
    );
  }
}
