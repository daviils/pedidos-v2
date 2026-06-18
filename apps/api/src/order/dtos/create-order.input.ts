import { Field, InputType, Int } from '@nestjs/graphql';

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
  tableId: string;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}
