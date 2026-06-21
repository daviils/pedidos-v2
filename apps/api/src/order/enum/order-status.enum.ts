import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Preparing = 'preparing',
  Done = 'done',
  Cancelled = 'cancelled',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});
