import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subscription } from './entity/subscription.entity';
import { SubscriptionResolver } from './resolver/subscription.resolver';
import { SubscriptionService } from './service/subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  providers: [SubscriptionResolver, SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
