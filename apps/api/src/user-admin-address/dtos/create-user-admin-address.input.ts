import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserAdminAddressInput {
  @Field(() => String)
  street: string;

  @Field(() => String)
  number: string;

  @Field(() => String, { nullable: true })
  complement?: string;

  @Field(() => String)
  neighborhood: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  state: string;

  @Field(() => String)
  zipCode: string;
}
