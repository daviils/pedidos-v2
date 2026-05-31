import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthToken } from '../../auth/entity/auth-token.entity';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CurrentUserAdmin } from '../decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../guard/gql-auth-admin.guard';
import { AuthAdminService } from '../service/auth-admin.service';

@Resolver()
export class AuthAdminResolver {
  constructor(private readonly authAdminService: AuthAdminService) {}

  @Mutation(() => AuthToken)
  loginAdmin(
    @Args('email', { type: () => String }) email: string,
    @Args('password', { type: () => String }) password: string,
  ): Promise<AuthToken> {
    return this.authAdminService.loginAdmin(email, password);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => UserAdmin)
  getMeAdmin(@CurrentUserAdmin() userAdmin: UserAdmin): UserAdmin {
    return userAdmin;
  }
}
