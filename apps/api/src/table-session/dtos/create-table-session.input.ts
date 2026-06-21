import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateTableSessionInput {
  @Field(() => String)
  tableId: string;
}
