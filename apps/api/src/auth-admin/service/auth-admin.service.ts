import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthToken } from '../../auth/entity/auth-token.entity';
import { JwtPayload } from '../../auth/type/jwt-payload.type';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { UserAdminService } from '../../user-admin/service/user-admin.service';

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userAdminService: UserAdminService,
  ) {}

  async loginAdmin(email: string, password: string): Promise<AuthToken> {
    const userAdmin = await this.userAdminService.findByEmail(email);

    if (!userAdmin || userAdmin.password !== password) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }

    const payload: JwtPayload = {
      sub: userAdmin.id,
      email: userAdmin.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<UserAdmin> {
    const userAdmin = await this.userAdminService.findById(payload.sub);

    if (!userAdmin) {
      throw new UnauthorizedException('Usuario admin nao autorizado');
    }

    return userAdmin;
  }
}
