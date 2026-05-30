import { Field, InputType } from '@nestjs/graphql';

import { UserProfile } from '../entity/user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  password: string;

  @Field(() => UserProfile, { nullable: true })
  profile?: UserProfile;
}
