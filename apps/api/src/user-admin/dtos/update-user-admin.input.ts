import { InputType, PartialType } from '@nestjs/graphql';

import { CreateUserAdminInput } from './create-user-admin.input';

@InputType()
export class UpdateUserAdminInput extends PartialType(CreateUserAdminInput) {}
