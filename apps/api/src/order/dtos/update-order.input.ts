import { Field, InputType, Int } from '@nestjs/graphql';
import { PartialType } from '@nestjs/graphql';

import { OrderStatus } from '../enum/order-status.enum';

@InputType()
class UpdateOrderItemInput {
  @Field(() => String)
  productId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class UpdateOrderInput {
  @Field(() => String, { nullable: true })
  tableId?: string;

  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field(() => [UpdateOrderItemInput], { nullable: true })
  items?: UpdateOrderItemInput[];
}
