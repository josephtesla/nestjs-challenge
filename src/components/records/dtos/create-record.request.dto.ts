import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecordFormat, RecordCategory } from '../schemas/record.enum';

export class CreateRecordRequestDTO {
  @ApiProperty({
    description: 'Artist of the record',
    type: String,
    example: 'The Beatles',
  })
  @IsString()
  @IsNotEmpty()
  artist: string;

  @ApiProperty({
    description: 'Album name',
    type: String,
    example: 'Abbey Road',
  })
  @IsString()
  @IsNotEmpty()
  album: string;

  @ApiProperty({
    description: 'Price of the record',
    type: Number,
    example: 30,
  })
  @IsNumber()
  @Min(0)
  @Max(10000)
  price: number;

  @ApiProperty({
    description: 'Quantity of the record in stock',
    type: Number,
    example: 1000,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  qty: number;

  @ApiProperty({
    description: 'Format of the record (Vinyl, CD, etc.)',
    enum: RecordFormat,
    example: RecordFormat.VINYL,
  })
  @IsEnum(RecordFormat)
  @IsNotEmpty()
  format: RecordFormat;

  @ApiProperty({
    description: 'Category or genre of the record (e.g., Rock, Jazz)',
    enum: RecordCategory,
    example: RecordCategory.ROCK,
  })
  @IsEnum(RecordCategory)
  @IsNotEmpty()
  category: RecordCategory;

  @ApiProperty({
    description: 'Musicbrainz identifier',
    type: String,
    example: 'b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d',
  })
  @IsOptional()
  mbid?: string;
}
