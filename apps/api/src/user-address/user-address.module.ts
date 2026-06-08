import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OpenRouteServiceModule } from '../open-route-service/open-route-service.module';
import { UserAddress } from './entity/user-address.entity';
import { UserAddressResolver } from './resolver/user-address.resolver';
import { UserAddressService } from './service/user-address.service';

@Module({
  imports: [OpenRouteServiceModule, TypeOrmModule.forFeature([UserAddress])],
  providers: [UserAddressResolver, UserAddressService],
  exports: [UserAddressService],
})
export class UserAddressModule {}
