import { Field, Float, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserAdmin } from '../../user-admin/entity/user-admin.entity';

@Entity('user_admin_addresses')
@ObjectType()
export class UserAdminAddress {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  userAdminId: string;

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

  @Field(() => UserAdmin)
  @ManyToOne(() => UserAdmin, (userAdmin) => userAdmin.addresses)
  @JoinColumn({ name: 'userAdminId' })
  userAdmin: UserAdmin;
}
