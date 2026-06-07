import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUserAdmin } from '../../auth-admin/decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { UserAdminSubscriptions } from '../../user-admin/entity/user-admin-subscriptions.entity';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CreateMercadoPagoPreferenceInput } from '../dtos/create-mercado-pago-preference.input';
import { MercadoPagoPreference } from '../dtos/mercado-pago-preference.type';
import { MercadoPagoService } from '../service/mercado-pago.service';

@Resolver()
export class MercadoPagoResolver {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => MercadoPagoPreference)
  createMercadoPagoPreference(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('data') data: CreateMercadoPagoPreferenceInput,
  ): Promise<MercadoPagoPreference> {
    return this.mercadoPagoService.createPreference(userAdmin, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => MercadoPagoPreference)
  pendingMercadoPagoPreference(
    @CurrentUserAdmin() userAdmin: UserAdmin,
  ): Promise<MercadoPagoPreference> {
    return this.mercadoPagoService.findPendingPreference(userAdmin);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => UserAdminSubscriptions)
  cancelMercadoPagoSubscription(
    @CurrentUserAdmin() userAdmin: UserAdmin,
  ): Promise<UserAdminSubscriptions> {
    return this.mercadoPagoService.cancelSubscription(userAdmin);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => MercadoPagoPreference)
  changeMercadoPagoSubscriptionPlan(
    @CurrentUserAdmin() userAdmin: UserAdmin,
    @Args('data') data: CreateMercadoPagoPreferenceInput,
  ): Promise<MercadoPagoPreference> {
    return this.mercadoPagoService.changeSubscriptionPlan(userAdmin, data);
  }
}
