import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Store } from './entity/store.entity';
import { StoreResolver } from './resolver/store.resolver';
import { StoreService } from './service/store.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  providers: [StoreResolver, StoreService],
  exports: [StoreService],
})
export class StoreModule {}
