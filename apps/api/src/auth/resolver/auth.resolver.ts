import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from '../../user/entity/user.entity';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthToken } from '../entity/auth-token.entity';
import { GqlAuthGuard } from '../guard/gql-auth.guard';
import { AuthService } from '../service/auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthToken)
  login(
    @Args('email', { type: () => String }) email: string,
    @Args('password', { type: () => String }) password: string,
  ): AuthToken {
    return this.authService.login(email, password);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  me(@CurrentUser() user: User): User {
    return user;
  }
}
