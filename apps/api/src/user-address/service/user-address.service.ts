import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserAddressInput } from '../dtos/create-user-address.input';
import { UpdateUserAddressInput } from '../dtos/update-user-address.input';
import { UserAddress } from '../entity/user-address.entity';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
  ) {}

  async create(
    userId: string,
    data: CreateUserAddressInput,
  ): Promise<UserAddress> {
    const userAddress = this.userAddressRepository.create({
      ...data,
      userId,
    });

    return this.userAddressRepository.save(userAddress);
  }

  findAll(userId: string): Promise<UserAddress[]> {
    return this.userAddressRepository.find({ where: { userId } });
  }

  findById(id: string, userId: string): Promise<UserAddress | null> {
    return this.userAddressRepository.findOne({ where: { id, userId } });
  }

  async update(
    userId: string,
    id: string,
    data: UpdateUserAddressInput,
  ): Promise<UserAddress> {
    const userAddress = await this.findById(id, userId);

    if (!userAddress) {
      throw new NotFoundException('Endereco do usuario nao encontrado');
    }

    Object.assign(userAddress, data);

    return this.userAddressRepository.save(userAddress);
  }

  async delete(userId: string, id: string): Promise<UserAddress> {
    const userAddress = await this.findById(id, userId);

    if (!userAddress) {
      throw new NotFoundException('Endereco do usuario nao encontrado');
    }

    await this.userAddressRepository.remove(userAddress);

    return userAddress;
  }
}
