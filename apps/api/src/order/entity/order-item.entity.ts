import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Order } from './order.entity';
import { Product } from '../../product/entity/product.entity';

@Entity('order_items')
@ObjectType()
export class OrderItem {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  orderId: string;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Field(() => String)
  @Column()
  productId: string;

  @Field(() => Product)
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Field(() => Int)
  @Column('int')
  quantity: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
