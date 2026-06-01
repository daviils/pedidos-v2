import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSubscriptionInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => Float)
  price: number;
}
