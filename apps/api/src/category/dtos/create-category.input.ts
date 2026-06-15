import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;
}
