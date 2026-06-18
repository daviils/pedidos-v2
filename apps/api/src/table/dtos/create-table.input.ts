import { Field, InputType } from '@nestjs/graphql';

import { TableStatus } from '../entity/table.entity';

@InputType()
export class CreateTableInput {
  @Field(() => String)
  name: string;

  @Field(() => TableStatus, { nullable: true })
  status?: TableStatus;
}
