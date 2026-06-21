import { Field, InputType, Int } from '@nestjs/graphql';

import { OrderStatus } from '../enum/order-status.enum';

@InputType()
class CreateOrderItemInput {
  @Field(() => String)
  productId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => String)
  tableSessionId: string;

  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}
