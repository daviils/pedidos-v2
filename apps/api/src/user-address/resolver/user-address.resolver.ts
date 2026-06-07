import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorator/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guard/gql-auth.guard';
import { User } from '../../user/entity/user.entity';
import { CreateUserAddressInput } from '../dtos/create-user-address.input';
import { UpdateUserAddressInput } from '../dtos/update-user-address.input';
import { UserAddress } from '../entity/user-address.entity';
import { UserAddressService } from '../service/user-address.service';

@Resolver(() => UserAddress)
@UseGuards(GqlAuthGuard)
export class UserAddressResolver {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Mutation(() => UserAddress)
  createUserAddress(
    @CurrentUser() user: User,
    @Args('data') data: CreateUserAddressInput,
  ): Promise<UserAddress> {
    return this.userAddressService.create(user.id, data);
  }

  @Query(() => [UserAddress])
  userAddresses(@CurrentUser() user: User): Promise<UserAddress[]> {
    return this.userAddressService.findAll(user.id);
  }

  @Query(() => UserAddress, { nullable: true })
  userAddress(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<UserAddress | null> {
    return this.userAddressService.findById(id, user.id);
  }

  @Mutation(() => UserAddress)
  updateUserAddress(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateUserAddressInput,
  ): Promise<UserAddress> {
    return this.userAddressService.update(user.id, id, data);
  }

  @Mutation(() => UserAddress)
  deleteUserAddress(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<UserAddress> {
    return this.userAddressService.delete(user.id, id);
  }
}
