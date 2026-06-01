import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MercadoPagoPreference {
  @Field(() => String)
  id: string;

  @Field(() => String)
  initPoint: string;

  @Field(() => String, { nullable: true })
  sandboxInitPoint?: string;

  @Field(() => String)
  userAdminSubscriptionId: string;
}
