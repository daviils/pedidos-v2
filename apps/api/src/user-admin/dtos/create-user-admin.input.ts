import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserAdminInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  password: string;
}
