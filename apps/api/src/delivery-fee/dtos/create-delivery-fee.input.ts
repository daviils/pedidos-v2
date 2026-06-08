import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class CreateDeliveryFeeInput {
  @Field(() => Float)
  distance: number;

  @Field(() => Float)
  value: number;
}
