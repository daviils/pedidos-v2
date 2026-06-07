import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserAdminAddress } from '../../user-admin-address/entity/user-admin-address.entity';

@Entity('user_admins')
@ObjectType()
export class UserAdmin {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Field(() => String)
  @Column()
  name: string;

  @Column()
  password: string;

  @Field(() => [UserAdminAddress])
  @OneToMany(() => UserAdminAddress, (address) => address.userAdmin)
  addresses: UserAdminAddress[];
}
