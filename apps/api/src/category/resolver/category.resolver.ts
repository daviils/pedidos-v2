import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { CreateCategoryInput } from '../dtos/create-category.input';
import { UpdateCategoryInput } from '../dtos/update-category.input';
import { Category } from '../entity/category.entity';
import { CategoryService } from '../service/category.service';
import { GqlAuthGuard } from '../../auth/guard/gql-auth.guard';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) { }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Category)
  createCategory(
    @Args('data') data: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.create(data);
  }

  @Query(() => [Category])
  categories(): Promise<Category[]> {
    return this.categoryService.findAll();
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
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Category)
  deleteCategory(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Category> {
    return this.categoryService.delete(id);
  }
}
