import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserAddress } from '../../user-address/entity/user-address.entity';

export enum UserProfile {
  User = 'user',
}

registerEnumType(UserProfile, {
  name: 'UserProfile',
});

@Entity('users')
@ObjectType()
export class User {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => UserProfile)
  @Column({
    type: 'simple-enum',
    enum: UserProfile,
    default: UserProfile.User,
  })
  profile: UserProfile;

  @Column()
  password: string;

  @Field(() => [UserAddress])
  @OneToMany(() => UserAddress, (address) => address.user)
  addresses: UserAddress[];
}
