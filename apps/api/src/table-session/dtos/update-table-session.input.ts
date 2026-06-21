import { InputType, PartialType } from '@nestjs/graphql';

import { CreateTableSessionInput } from './create-table-session.input';

@InputType()
export class UpdateTableSessionInput extends PartialType(CreateTableSessionInput) {}
