import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAdminResolver } from './resolver/user-admin.resolver';
import { UserAdminService } from './service/user-admin.service';
import { UserAdmin } from './entity/user-admin.entity';
import { UserAdminSubscriptions } from './entity/user-admin-subscriptions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAdmin, UserAdminSubscriptions])],
  providers: [UserAdminResolver, UserAdminService],
  exports: [UserAdminService],
})
export class UserAdminModule {}
