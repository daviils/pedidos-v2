import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateMercadoPagoPreferenceInput {
  @Field(() => String)
  subscriptionId: string;

  @Field(() => String, { nullable: true })
  successUrl?: string;

  @Field(() => String, { nullable: true })
  failureUrl?: string;

  @Field(() => String, { nullable: true })
  pendingUrl?: string;

  @Field(() => String, { nullable: true })
  notificationUrl?: string;
}
