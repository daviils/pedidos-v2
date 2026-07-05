import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUserAdmin } from '../../auth-admin/decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CreateProductInput } from '../dtos/create-product.input';
import { UpdateProductInput } from '../dtos/update-product.input';
import { Product } from '../entity/product.entity';
import { ProductService } from '../service/product.service';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Product)
  createProduct(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('storeId', { type: () => String }) storeId: string,
    @Args('data') data: CreateProductInput,
  ): Promise<Product> {
    return this.productService.create(storeId, data);
  }

  @Query(() => [Product])
  products(
    @Args('storeId', { type: () => String }) storeId: string,
  ): Promise<Product[]> {
    return this.productService.findAll(storeId);
  }

  @Query(() => Product, { nullable: true })
  product(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Product | null> {
    return this.productService.findById(id);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Product)
  updateProduct(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateProductInput,
  ): Promise<Product> {
    return this.productService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Product)
  deleteProduct(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Product> {
    return this.productService.delete(id);
  }
}
