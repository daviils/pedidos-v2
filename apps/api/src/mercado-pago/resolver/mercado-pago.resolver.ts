import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CurrentUserAdmin } from '../../auth-admin/decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
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
}
