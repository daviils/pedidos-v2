import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUserAdmin } from '../../auth-admin/decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CreateCategoryInput } from '../dtos/create-category.input';
import { UpdateCategoryInput } from '../dtos/update-category.input';
import { Category } from '../entity/category.entity';
import { CategoryService } from '../service/category.service';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Category)
  createCategory(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('storeId', { type: () => String }) storeId: string,
    @Args('data') data: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.create(storeId, data);
  }

  @Query(() => [Category])
  categories(
    @Args('storeId', { type: () => String }) storeId: string,
  ): Promise<Category[]> {
    return this.categoryService.findAll(storeId);
  }

  @Query(() => Category, { nullable: true })
  category(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Category | null> {
    return this.categoryService.findById(id);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Category)
  updateCategory(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Category)
  deleteCategory(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Category> {
    return this.categoryService.delete(id);
  }
}
