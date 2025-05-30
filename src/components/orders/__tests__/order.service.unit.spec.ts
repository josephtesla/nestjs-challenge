import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderService } from '../order.service';
import { OrderRepository } from '../order.repository';
import { RecordRepository } from '../../records/record.repository';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';

const makeSession = () => ({
  withTransaction: jest.fn(),
  endSession: jest.fn(),
});

function makeTransientError() {
  const err: any = new Error('transient transaction error');
  err.errorLabels = ['TransientTransactionError'];
  return err;
}

const ORDER_DTO: CreateOrderRequestDTO = {
  recordId: '665ae7d0f6b728acb40b9626',
  quantity: 2,
};

const ORDER_DOC = {
  _id: 'order-id',
  recordId: ORDER_DTO.recordId,
  quantity: ORDER_DTO.quantity,
  unitPrice: 20,
  totalPrice: 40,
} as any;

const recordRepository = {
  startSession: jest.fn(),
  reserveStockQuantity: jest.fn(),
};
const orderRepository = {
  create: jest.fn(),
  findAll: jest.fn().mockResolvedValue([ORDER_DOC]),
};

describe('OrderService (unit)', () => {
  let orderService: OrderService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: RecordRepository, useValue: recordRepository },
        { provide: OrderRepository, useValue: orderRepository },
      ],
    }).compile();

    orderService = module.get(OrderService);
  });

  afterEach(jest.clearAllMocks);

  describe('create', () => {
    it('creates order & decrements stock in one transaction', async () => {
      const session = makeSession();
      recordRepository.startSession.mockResolvedValue(session);
      session.withTransaction.mockImplementation(async (fn: any) => {
        recordRepository.reserveStockQuantity.mockResolvedValue({
          id: ORDER_DTO.recordId,
          price: 20,
        });
        orderRepository.create.mockResolvedValue(ORDER_DOC);
        return fn();
      });

      const res = await orderService.create(ORDER_DTO);
      expect(res).toBe(ORDER_DOC);
      expect(session.withTransaction).toHaveBeenCalledTimes(1);
      expect(recordRepository.reserveStockQuantity).toHaveBeenCalledWith(
        ORDER_DTO.recordId,
        ORDER_DTO.quantity,
        session,
      );
      expect(orderRepository.create).toHaveBeenCalledWith(
        {
          recordId: ORDER_DTO.recordId,
          quantity: 2,
          unitPrice: 20,
          totalPrice: 40,
        },
        session,
      );
      expect(session.endSession).toHaveBeenCalled();
    });

    it('throws NotFoundException when record is missing', async () => {
      const session = makeSession();
      recordRepository.startSession.mockResolvedValue(session);

      session.withTransaction.mockImplementation(async (fn: any) => {
        recordRepository.reserveStockQuantity.mockResolvedValue('not_found');
        return fn();
      });

      await expect(orderService.create(ORDER_DTO)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when stock is insufficient', async () => {
      const session = makeSession();
      recordRepository.startSession.mockResolvedValue(session);

      session.withTransaction.mockImplementation(async (fn: any) => {
        recordRepository.reserveStockQuantity.mockResolvedValue('insufficient_stock');
        return fn();
      });

      await expect(orderService.create(ORDER_DTO)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('retries transaction on TransientTransactionError and succeeds', async () => {
      const session1 = makeSession();
      const session2 = makeSession();

      recordRepository.startSession
        .mockResolvedValueOnce(session1)
        .mockResolvedValueOnce(session2); // call for second attempt

      // first attempt throws transient error
      session1.withTransaction.mockRejectedValue(makeTransientError());

      // second attempt succeeds.
      session2.withTransaction.mockImplementation(async (fn: any) => {
        recordRepository.reserveStockQuantity.mockResolvedValue({
          id: ORDER_DTO.recordId,
          price: 20,
        });
        orderRepository.create.mockResolvedValue(ORDER_DOC);
        return fn();
      });

      const res = await orderService.create(ORDER_DTO);

      expect(res).toBe(ORDER_DOC);
      expect(session1.withTransaction).toHaveBeenCalled();
      expect(session2.withTransaction).toHaveBeenCalled();
    });

    it('propagates error after max retries', async () => {
      const session = makeSession();
      recordRepository.startSession.mockResolvedValue(session);
      session.withTransaction.mockRejectedValue(makeTransientError());

      await expect(orderService.create(ORDER_DTO)).rejects.toThrow(
        'transient transaction error',
      );
      expect(session.withTransaction).toHaveBeenCalledTimes(3); // default max retries
    });
  });

  describe('findAll', () => {
    it('returns all orders', async () => {
      const res = await orderService.findAll();
      expect(res).toEqual([ORDER_DOC]);
      expect(orderRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
