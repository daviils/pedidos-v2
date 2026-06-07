import { InputType, PartialType } from '@nestjs/graphql';

import { CreateUserAdminAddressInput } from './create-user-admin-address.input';

@InputType()
export class UpdateUserAdminAddressInput extends PartialType(
  CreateUserAdminAddressInput,
) {}
