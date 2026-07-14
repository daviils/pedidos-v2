import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserAdminInput } from '../dtos/create-user-admin.input';
import { UpdateUserAdminInput } from '../dtos/update-user-admin.input';
import { UserAdmin } from '../entity/user-admin.entity';

@Injectable()
export class UserAdminService {
  constructor(
    @InjectRepository(UserAdmin)
    private readonly userAdminRepository: Repository<UserAdmin>,
  ) {}

  async create(data: CreateUserAdminInput): Promise<UserAdmin> {
    const userAdmin = this.userAdminRepository.create(data);

    return this.userAdminRepository.save(userAdmin);
  }

  findAll(): Promise<UserAdmin[]> {
    return this.userAdminRepository.find();
  }

  findById(id: string): Promise<UserAdmin | null> {
    return this.userAdminRepository.findOne({ where: { id } });
  }

  async findByIdWithStores(id: string): Promise<UserAdmin> {
    const userAdmin = await this.userAdminRepository.findOne({
      where: { id },
      relations: { stores: true },
    });

    if (!userAdmin) {
      throw new NotFoundException('Usuario admin nao encontrado');
    }

    return userAdmin;
  }

  findByEmail(email: string): Promise<UserAdmin | null> {
    return this.userAdminRepository.findOne({ where: { email } });
  }

  async update(id: string, data: UpdateUserAdminInput): Promise<UserAdmin> {
    const userAdmin = await this.findById(id);

    if (!userAdmin) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    Object.assign(userAdmin, data);

    return this.userAdminRepository.save(userAdmin);
  }

  async delete(id: string): Promise<UserAdmin> {
    const userAdmin = await this.findById(id);

    if (!userAdmin) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    await this.userAdminRepository.remove(userAdmin);

    return userAdmin;
  }
}
