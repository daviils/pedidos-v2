import { Field, ObjectType } from '@nestjs/graphql';
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
  @Column({ nullable: true })
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

  @Field(() => UserAdmin)
  @ManyToOne(() => UserAdmin, (userAdmin) => userAdmin.addresses)
  @JoinColumn({ name: 'userAdminId' })
  userAdmin: UserAdmin;
}
