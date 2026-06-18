import { Field, InputType, Int } from '@nestjs/graphql';
import { PartialType } from '@nestjs/graphql';

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

  @Field(() => [UpdateOrderItemInput], { nullable: true })
  items?: UpdateOrderItemInput[];
}
