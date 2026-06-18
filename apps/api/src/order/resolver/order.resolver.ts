import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { CreateOrderInput } from '../dtos/create-order.input';
import { UpdateOrderInput } from '../dtos/update-order.input';
import { Order } from '../entity/order.entity';
import { OrderService } from '../service/order.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Order)
  createOrder(@Args('data') data: CreateOrderInput): Promise<Order> {
    return this.orderService.create(data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => [Order])
  orders(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => Order, { nullable: true })
  order(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Order | null> {
    return this.orderService.findById(id);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Order)
  updateOrder(
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateOrderInput,
  ): Promise<Order> {
    return this.orderService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Order)
  deleteOrder(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Order> {
    return this.orderService.delete(id);
  }
}
