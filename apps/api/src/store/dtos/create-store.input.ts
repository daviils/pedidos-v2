import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateStoreInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}
