import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../product/entity/product.entity';
import { TableSession } from '../table-session/entity/table-session.entity';
import { OrderItem } from './entity/order-item.entity';
import { Order } from './entity/order.entity';
import { OrderResolver } from './resolver/order.resolver';
import { OrderService } from './service/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, TableSession])],
  providers: [OrderResolver, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
