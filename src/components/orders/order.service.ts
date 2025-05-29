import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { RecordRepository } from '../records/record.repository';
import { CreateOrderRequestDTO } from './dtos/create-order.request.dto';
import { Order } from './schemas/order.schema';
import { RecordMessages } from '../records/results';
import { runTransactionWithRetry } from '../../utils/run-transaction-with-retry';

const MAX_TX_RETRIES = 3;

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly recordRepository: RecordRepository,
  ) {}

  async create(dto: CreateOrderRequestDTO): Promise<Order> {
    return runTransactionWithRetry(
      () => this.recordRepository.startSession(),
      async (session) => {
        const record = await this.recordRepository.reserveStockQuantity(
          dto.recordId,
          dto.quantity,
          session,
        );

        if (record === 'not_found') {
          throw new NotFoundException(RecordMessages.FAILURE.RECORD_NOT_FOUND);
        }

        if (record === 'insufficient_stock') {
          throw new BadRequestException(RecordMessages.FAILURE.INSUFFICIENT_STOCK);
        }

        return this.orderRepository.create(
          {
            recordId: record.id,
            quantity: dto.quantity,
            unitPrice: record.price,
            totalPrice: record.price * dto.quantity,
          },
          session,
        );
      },
      MAX_TX_RETRIES,
    );
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }
}
