import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './entity/product.entity';
import { ProductResolver } from './resolver/product.resolver';
import { ProductService } from './service/product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductResolver, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
