import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subscription } from '../subscription/entity/subscription.entity';
import { UserAdminSubscriptions } from '../user-admin/entity/user-admin-subscriptions.entity';
import { MercadoPagoController } from './controller/mercado-pago.controller';
import { MercadoPagoResolver } from './resolver/mercado-pago.resolver';
import { MercadoPagoService } from './service/mercado-pago.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, UserAdminSubscriptions])],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoResolver, MercadoPagoService],
})
export class MercadoPagoModule {}
