import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
