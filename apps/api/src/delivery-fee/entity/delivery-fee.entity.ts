import { Field, Float, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserAdmin } from '../../user-admin/entity/user-admin.entity';

@Entity('delivery_fees')
@ObjectType()
export class DeliveryFee {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  userAdminId: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  distance: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Field(() => UserAdmin)
  @ManyToOne(() => UserAdmin, (userAdmin) => userAdmin.deliveryFees)
  @JoinColumn({ name: 'userAdminId' })
  userAdmin: UserAdmin;
}
