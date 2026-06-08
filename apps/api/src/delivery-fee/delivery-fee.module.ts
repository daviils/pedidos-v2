import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveryFee } from './entity/delivery-fee.entity';
import { DeliveryFeeResolver } from './resolver/delivery-fee.resolver';
import { DeliveryFeeService } from './service/delivery-fee.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryFee])],
  providers: [DeliveryFeeResolver, DeliveryFeeService],
  exports: [DeliveryFeeService],
})
export class DeliveryFeeModule {}
