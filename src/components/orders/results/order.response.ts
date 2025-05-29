import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResultWithData } from '../../../common/results';

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

export class OrderResponse extends BaseResultWithData<OrderEntity> {
  @ApiProperty({ type: () => OrderEntity })
  data: OrderEntity;

  constructor(status: HttpStatus, message: string, data: OrderEntity) {
    super(status, message, data);
  }

  static created(data: OrderEntity) {
    return new OrderResponse(HttpStatus.CREATED, 'Order created successfully', data);
  }
}
