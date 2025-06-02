import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../../../common/results';

export class OrderEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  recordId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderResponse extends BaseResponse<OrderEntity> {
  @ApiProperty({ type: () => OrderEntity })
  data: OrderEntity;

  constructor(params: { statusCode: HttpStatus; message: string; data: any }) {
    super(params);
  }

  static created(data: any) {
    return new OrderResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Order successfully created',
      data,
    });
  }
}
