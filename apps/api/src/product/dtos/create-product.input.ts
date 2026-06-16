import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  photoUrl: string;

  @Field(() => Float)
  price: number;

  @Field(() => String, { nullable: true })
  categoryId?: string;
}
