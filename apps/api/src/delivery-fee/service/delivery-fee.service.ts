import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDeliveryFeeInput } from '../dtos/create-delivery-fee.input';
import { UpdateDeliveryFeeInput } from '../dtos/update-delivery-fee.input';
import { DeliveryFee } from '../entity/delivery-fee.entity';

@Injectable()
export class DeliveryFeeService {
  constructor(
    @InjectRepository(DeliveryFee)
    private readonly deliveryFeeRepository: Repository<DeliveryFee>,
  ) {}

  async create(
    userAdminId: string,
    data: CreateDeliveryFeeInput,
  ): Promise<DeliveryFee> {
    const deliveryFee = this.deliveryFeeRepository.create({
      ...data,
      userAdminId,
    });

    return this.deliveryFeeRepository.save(deliveryFee);
  }

  findAll(userAdminId: string): Promise<DeliveryFee[]> {
    return this.deliveryFeeRepository.find({ where: { userAdminId } });
  }

  findById(id: string, userAdminId: string): Promise<DeliveryFee | null> {
    return this.deliveryFeeRepository.findOne({ where: { id, userAdminId } });
  }

  async update(
    userAdminId: string,
    id: string,
    data: UpdateDeliveryFeeInput,
  ): Promise<DeliveryFee> {
    const deliveryFee = await this.findById(id, userAdminId);

    if (!deliveryFee) {
      throw new NotFoundException('Taxa de entrega nao encontrada');
    }

    Object.assign(deliveryFee, data);

    return this.deliveryFeeRepository.save(deliveryFee);
  }

  async delete(userAdminId: string, id: string): Promise<DeliveryFee> {
    const deliveryFee = await this.findById(id, userAdminId);

    if (!deliveryFee) {
      throw new NotFoundException('Taxa de entrega nao encontrada');
    }

    await this.deliveryFeeRepository.remove(deliveryFee);

    return deliveryFee;
  }
}
