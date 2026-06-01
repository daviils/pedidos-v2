import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Subscription } from '../../subscription/entity/subscription.entity';
import { UserAdmin } from './user-admin.entity';

export enum UserAdminSubscriptionStatus {
  Active = 'active',
  Pending = 'pending',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

registerEnumType(UserAdminSubscriptionStatus, {
  name: 'UserAdminSubscriptionStatus',
});

@Entity('user_admin_subscriptions')
@ObjectType()
export class UserAdminSubscriptions {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  userAdminId: string;

  @Field(() => String)
  @Column()
  mercadoPagoId: string;

  @Field(() => String)
  @Column()
  subscriptionsId: string;

  @Field(() => UserAdminSubscriptionStatus)
  @Column({
    type: 'simple-enum',
    enum: UserAdminSubscriptionStatus,
  })
  status: UserAdminSubscriptionStatus;

  @Field(() => UserAdmin)
  @ManyToOne(() => UserAdmin)
  @JoinColumn({ name: 'userAdminId' })
  userAdmin: UserAdmin;

  @Field(() => Subscription)
  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscriptionsId' })
  subscription: Subscription;
}
