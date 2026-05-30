import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateUserInput } from '../dtos/create-user.input';
import { UpdateUserInput } from '../dtos/update-user.input';
import { User } from '../entity/user.entity';
import { UserService } from '../service/user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('data') data: CreateUserInput): Promise<User> {
    return this.userService.create(data);
  }

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { nullable: true })
  user(@Args('id', { type: () => String }) id: string): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateUserInput,
  ): Promise<User> {
    return this.userService.update(id, data);
  }

  @Mutation(() => User)
  deleteUser(@Args('id', { type: () => String }) id: string): Promise<User> {
    return this.userService.delete(id);
  }
}
