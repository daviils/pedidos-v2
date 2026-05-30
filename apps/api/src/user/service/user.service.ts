import { Injectable } from '@nestjs/common';

import { User } from '../entity/user.entity';

@Injectable()
export class UserService {
  private readonly users: User[] = [
    {
      id: '1',
      email: 'admin@pedidos.com',
      password: 'admin',
    },
  ];

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }
}
