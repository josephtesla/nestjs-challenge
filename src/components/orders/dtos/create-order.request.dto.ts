import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsInt, Min } from 'class-validator';

export class CreateOrderRequestDTO {
  @ApiProperty({
    description: 'ID of the record to order',
    example: '60c72b2f9b1d8c001c8e4f3a',
  })
  @IsMongoId()
  recordId: string;

  @ApiProperty({
    description: 'Quantity of records to order',
    minimum: 1,
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
