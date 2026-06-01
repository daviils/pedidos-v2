import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { CreateSubscriptionInput } from '../dtos/create-subscription.input';
import { UpdateSubscriptionInput } from '../dtos/update-subscription.input';
import { Subscription } from '../entity/subscription.entity';
import { SubscriptionService } from '../service/subscription.service';

@Resolver(() => Subscription)
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Subscription)
  createSubscription(
    @Args('data') data: CreateSubscriptionInput,
  ): Promise<Subscription> {
    return this.subscriptionService.create(data);
  }

  @Query(() => [Subscription])
  subscriptions(): Promise<Subscription[]> {
    return this.subscriptionService.findAll();
  }

  @Query(() => Subscription, { nullable: true })
  subscription(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Subscription | null> {
    return this.subscriptionService.findById(id);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Subscription)
  updateSubscription(
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    return this.subscriptionService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Subscription)
  deleteSubscription(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Subscription> {
    return this.subscriptionService.delete(id);
  }
}
