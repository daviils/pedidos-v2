import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { UserAdmin } from '../../user-admin/entity/user-admin.entity';

export const CurrentUserAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserAdmin => {
    const gqlContext = GqlExecutionContext.create(context);

    return gqlContext.getContext().req.user;
  },
);
