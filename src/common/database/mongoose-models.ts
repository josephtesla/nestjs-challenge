import { Record, RecordSchema } from '../../components/records/schemas/record.schema';
import { Order, OrderSchema } from '../../components/orders/schemas/order.schema';

export const mongooseModels = [
  { name: Record.name, schema: RecordSchema },
  { name: Order.name, schema: OrderSchema },
];
