import { InputType, PartialType } from '@nestjs/graphql';

import { CreateTableInput } from './create-table.input';

@InputType()
export class UpdateTableInput extends PartialType(CreateTableInput) {}
