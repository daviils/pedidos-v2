import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUserAdmin } from '../../auth-admin/decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CreateStoreInput } from '../dtos/create-store.input';
import { UpdateStoreInput } from '../dtos/update-store.input';
import { Store } from '../entity/store.entity';
import { StoreService } from '../service/store.service';

@Resolver(() => Store)
@UseGuards(GqlAuthAdminGuard)
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  @Mutation(() => Store)
  createStore(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('data') data: CreateStoreInput,
  ): Promise<Store> {
    return this.storeService.create(userAdmin.id, data);
  }

  @Query(() => [Store])
  stores(@CurrentUserAdmin() userAdmin: UserAdmin): Promise<Store[]> {
    return this.storeService.findAll(userAdmin.id);
  }

  @Query(() => Store, { nullable: true })
  store(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Store | null> {
    return this.storeService.findById(id, userAdmin.id);
  }

  @Mutation(() => Store)
  updateStore(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateStoreInput,
  ): Promise<Store> {
    return this.storeService.update(userAdmin.id, id, data);
  }

  @Mutation(() => Store)
  deleteStore(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Store> {
    return this.storeService.delete(userAdmin.id, id);
  }
}
