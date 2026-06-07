import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserAdminAddressInput } from '../dtos/create-user-admin-address.input';
import { UpdateUserAdminAddressInput } from '../dtos/update-user-admin-address.input';
import { UserAdminAddress } from '../entity/user-admin-address.entity';

@Injectable()
export class UserAdminAddressService {
  constructor(
    @InjectRepository(UserAdminAddress)
    private readonly userAdminAddressRepository: Repository<UserAdminAddress>,
  ) {}

  async create(
    userAdminId: string,
    data: CreateUserAdminAddressInput,
  ): Promise<UserAdminAddress> {
    const userAdminAddress = this.userAdminAddressRepository.create({
      ...data,
      userAdminId,
    });

    return this.userAdminAddressRepository.save(userAdminAddress);
  }

  findAll(userAdminId: string): Promise<UserAdminAddress[]> {
    return this.userAdminAddressRepository.find({ where: { userAdminId } });
  }

  findById(
    id: string,
    userAdminId: string,
  ): Promise<UserAdminAddress | null> {
    return this.userAdminAddressRepository.findOne({
      where: { id, userAdminId },
    });
  }

  async update(
    userAdminId: string,
    id: string,
    data: UpdateUserAdminAddressInput,
  ): Promise<UserAdminAddress> {
    const userAdminAddress = await this.findById(id, userAdminId);

    if (!userAdminAddress) {
      throw new NotFoundException('Endereco do usuario admin nao encontrado');
    }

    Object.assign(userAdminAddress, data);

    return this.userAdminAddressRepository.save(userAdminAddress);
  }

  async delete(userAdminId: string, id: string): Promise<UserAdminAddress> {
    const userAdminAddress = await this.findById(id, userAdminId);

    if (!userAdminAddress) {
      throw new NotFoundException('Endereco do usuario admin nao encontrado');
    }

    await this.userAdminAddressRepository.remove(userAdminAddress);

    return userAdminAddress;
  }
}
