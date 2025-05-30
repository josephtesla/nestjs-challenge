import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderRequestDTO } from './dtos/create-order.request.dto';
import { OrderResponse } from './results/order.response';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an order for record and decrement quantity in stock' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponse })
  @ApiResponse({ status: 400, description: 'Bad Request - Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async create(@Body() dto: CreateOrderRequestDTO) {
    const order = await this.orderService.create(dto);
    return OrderResponse.created(order);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'List of all orders' })
  async findAll() {
    const data = await this.orderService.findAll();
    return { data, message: 'Orders retrieved successfully', statusCode: HttpStatus.OK };
  }
}
