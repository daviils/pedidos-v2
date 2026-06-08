import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUserAdmin } from '../../auth-admin/decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CreateDeliveryFeeInput } from '../dtos/create-delivery-fee.input';
import { UpdateDeliveryFeeInput } from '../dtos/update-delivery-fee.input';
import { DeliveryFee } from '../entity/delivery-fee.entity';
import { DeliveryFeeService } from '../service/delivery-fee.service';

@Resolver(() => DeliveryFee)
@UseGuards(GqlAuthAdminGuard)
export class DeliveryFeeResolver {
  constructor(private readonly deliveryFeeService: DeliveryFeeService) {}

  @Mutation(() => DeliveryFee)
  createDeliveryFee(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('data') data: CreateDeliveryFeeInput,
  ): Promise<DeliveryFee> {
    return this.deliveryFeeService.create(userAdmin.id, data);
  }

  @Query(() => [DeliveryFee])
  deliveryFees(
    @CurrentUserAdmin() userAdmin: UserAdmin,
  ): Promise<DeliveryFee[]> {
    return this.deliveryFeeService.findAll(userAdmin.id);
  }

  @Query(() => DeliveryFee, { nullable: true })
  deliveryFee(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<DeliveryFee | null> {
    return this.deliveryFeeService.findById(id, userAdmin.id);
  }

  @Mutation(() => DeliveryFee)
  updateDeliveryFee(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateDeliveryFeeInput,
  ): Promise<DeliveryFee> {
    return this.deliveryFeeService.update(userAdmin.id, id, data);
  }

  @Mutation(() => DeliveryFee)
  deleteDeliveryFee(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<DeliveryFee> {
    return this.deliveryFeeService.delete(userAdmin.id, id);
  }
}
