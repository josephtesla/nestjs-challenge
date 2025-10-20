import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PopulateRecordsRequestDTO {
  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 1000,
    description: 'Number of records to generate',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  count = 20;
}
