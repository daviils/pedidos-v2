import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAddress } from './entity/user-address.entity';
import { UserAddressResolver } from './resolver/user-address.resolver';
import { UserAddressService } from './service/user-address.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddress])],
  providers: [UserAddressResolver, UserAddressService],
  exports: [UserAddressService],
})
export class UserAddressModule {}
