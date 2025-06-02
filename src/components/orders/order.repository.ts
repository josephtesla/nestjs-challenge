import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class OrderRepository {
  constructor(@InjectModel(Order.name) private readonly model: Model<Order>) {}

  async startSession() {
    return this.model.db.startSession();
  }

  async create(data: Partial<Order>, session?: ClientSession): Promise<Order> {
    const order = new this.model(data);
    await order.save({ session });
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.model.find().exec();
  }
}
