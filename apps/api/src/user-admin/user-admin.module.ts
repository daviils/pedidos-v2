import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAdminResolver } from './resolver/user-admin.resolver';
import { UserAdminService } from './service/user-admin.service';
import { UserAdmin } from './entity/user-admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAdmin])],
  providers: [UserAdminResolver, UserAdminService],
  exports: [UserAdminService],
})
export class UserAdminModule {}
