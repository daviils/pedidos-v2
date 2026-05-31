import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { CreateProductInput } from '../dtos/create-product.input';
import { UpdateProductInput } from '../dtos/update-product.input';
import { Product } from '../entity/product.entity';
import { ProductService } from '../service/product.service';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Product)
  createProduct(@Args('data') data: CreateProductInput): Promise<Product> {
    return this.productService.create(data);
  }

  @Query(() => [Product])
  products(): Promise<Product[]> {
    return this.productService.findAll();
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
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateProductInput,
  ): Promise<Product> {
    return this.productService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Product)
  deleteProduct(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Product> {
    return this.productService.delete(id);
  }
}
