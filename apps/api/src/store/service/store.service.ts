import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateStoreInput } from '../dtos/create-store.input';
import { UpdateStoreInput } from '../dtos/update-store.input';
import { Store } from '../entity/store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(userAdminId: string, data: CreateStoreInput): Promise<Store> {
    const store = this.storeRepository.create({
      ...data,
      userAdminId,
    });

    return this.storeRepository.save(store);
  }

  findAll(userAdminId: string): Promise<Store[]> {
    return this.storeRepository.find({ where: { userAdminId } });
  }

  findById(id: string, userAdminId: string): Promise<Store | null> {
    return this.storeRepository.findOne({ where: { id, userAdminId } });
  }

  async update(
    userAdminId: string,
    id: string,
    data: UpdateStoreInput,
  ): Promise<Store> {
    const store = await this.findById(id, userAdminId);

    if (!store) {
      throw new NotFoundException('Loja nao encontrada');
    }

    Object.assign(store, data);

    return this.storeRepository.save(store);
  }

  async delete(userAdminId: string, id: string): Promise<Store> {
    const store = await this.findById(id, userAdminId);

    if (!store) {
      throw new NotFoundException('Loja nao encontrada');
    }

    await this.storeRepository.remove(store);

    return store;
  }
}
