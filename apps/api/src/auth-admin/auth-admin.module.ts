import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { jwtConstants } from '../auth/constant/jwt.constant';
import { UserAdminModule } from '../user-admin/user-admin.module';
import { AuthAdminResolver } from './resolver/auth-admin.resolver';
import { AuthAdminService } from './service/auth-admin.service';
import { JwtAdminStrategy } from './strategy/jwt-admin.strategy';

@Module({
  imports: [
    UserAdminModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  providers: [AuthAdminResolver, AuthAdminService, JwtAdminStrategy],
})
export class AuthAdminModule {}
