import { Field, Float, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';

@Entity('user_addresses')
@ObjectType()
export class UserAddress {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  userId: string;

  @Field(() => String)
  @Column()
  street: string;

  @Field(() => String)
  @Column()
  number: string;

  @Field(() => String, { nullable: true })
  @Column('nvarchar', { nullable: true })
  complement: string | null;

  @Field(() => String)
  @Column()
  neighborhood: string;

  @Field(() => String)
  @Column()
  city: string;

  @Field(() => String)
  @Column()
  state: string;

  @Field(() => String)
  @Column()
  zipCode: string;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'userId' })
  user: User;
}
