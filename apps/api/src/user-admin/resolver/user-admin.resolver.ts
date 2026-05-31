import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateUserAdminInput } from '../dtos/create-user-admin.input';
import { UpdateUserAdminInput } from '../dtos/update-user-admin.input';
import { UserAdmin } from '../entity/user-admin.entity';
import { UserAdminService } from '../service/user-admin.service';

@Resolver(() => UserAdmin)
export class UserAdminResolver {
  constructor(private readonly userAdminService: UserAdminService) {}

  @Mutation(() => UserAdmin)
  createUserAdmin(
    @Args('data') data: CreateUserAdminInput,
  ): Promise<UserAdmin> {
    return this.userAdminService.create(data);
  }

  @Query(() => [UserAdmin])
  usersAdmin(): Promise<UserAdmin[]> {
    return this.userAdminService.findAll();
  }

  @Query(() => UserAdmin, { nullable: true })
  userAdmin(
    @Args('id', { type: () => String }) id: string,
  ): Promise<UserAdmin | null> {
    return this.userAdminService.findById(id);
  }

  @Mutation(() => UserAdmin)
  updateUserAdmin(
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateUserAdminInput,
  ): Promise<UserAdmin> {
    return this.userAdminService.update(id, data);
  }

  @Mutation(() => UserAdmin)
  deleteUserAdmin(
    @Args('id', { type: () => String }) id: string,
  ): Promise<UserAdmin> {
    return this.userAdminService.delete(id);
  }
}
