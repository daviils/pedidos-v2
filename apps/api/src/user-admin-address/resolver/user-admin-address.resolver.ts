import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUserAdmin } from '../../auth-admin/decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CreateUserAdminAddressInput } from '../dtos/create-user-admin-address.input';
import { UpdateUserAdminAddressInput } from '../dtos/update-user-admin-address.input';
import { UserAdminAddress } from '../entity/user-admin-address.entity';
import { UserAdminAddressService } from '../service/user-admin-address.service';

@Resolver(() => UserAdminAddress)
@UseGuards(GqlAuthAdminGuard)
export class UserAdminAddressResolver {
  constructor(
    private readonly userAdminAddressService: UserAdminAddressService,
  ) {}

  @Mutation(() => UserAdminAddress)
  createUserAdminAddress(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('data') data: CreateUserAdminAddressInput,
  ): Promise<UserAdminAddress> {
    return this.userAdminAddressService.create(userAdmin.id, data);
  }

  @Query(() => [UserAdminAddress])
  userAdminAddresses(
    @CurrentUserAdmin() userAdmin: UserAdmin,
  ): Promise<UserAdminAddress[]> {
    return this.userAdminAddressService.findAll(userAdmin.id);
  }

  @Query(() => UserAdminAddress, { nullable: true })
  userAdminAddress(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<UserAdminAddress | null> {
    return this.userAdminAddressService.findById(id, userAdmin.id);
  }

  @Mutation(() => UserAdminAddress)
  updateUserAdminAddress(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateUserAdminAddressInput,
  ): Promise<UserAdminAddress> {
    return this.userAdminAddressService.update(userAdmin.id, id, data);
  }

  @Mutation(() => UserAdminAddress)
  deleteUserAdminAddress(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<UserAdminAddress> {
    return this.userAdminAddressService.delete(userAdmin.id, id);
  }
}
