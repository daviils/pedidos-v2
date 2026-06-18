import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Table } from '../../table/entity/table.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
@ObjectType()
export class Order {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  tableId: string;

  @Field(() => Table)
  @ManyToOne(() => Table)
  @JoinColumn({ name: 'tableId' })
  table: Table;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
