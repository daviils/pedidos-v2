import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OpenRouteServiceModule } from '../open-route-service/open-route-service.module';
import { UserAdminAddress } from './entity/user-admin-address.entity';
import { UserAdminAddressResolver } from './resolver/user-admin-address.resolver';
import { UserAdminAddressService } from './service/user-admin-address.service';

@Module({
  imports: [OpenRouteServiceModule, TypeOrmModule.forFeature([UserAdminAddress])],
  providers: [UserAdminAddressResolver, UserAdminAddressService],
  exports: [UserAdminAddressService],
})
export class UserAdminAddressModule {}
