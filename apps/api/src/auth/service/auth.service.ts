import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../user/entity/user.entity';
import { UserService } from '../../user/service/user.service';
import { AuthToken } from '../entity/auth-token.entity';
import { JwtPayload } from '../type/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  login(email: string, password: string): AuthToken {
    const user = this.userService.findByEmail(email);

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
    };
  }

  validateJwtPayload(payload: JwtPayload): User {
    const user = this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario nao autorizado');
    }

    return user;
  }
}
