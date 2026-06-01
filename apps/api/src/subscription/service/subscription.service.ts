import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSubscriptionInput } from '../dtos/create-subscription.input';
import { UpdateSubscriptionInput } from '../dtos/update-subscription.input';
import { Subscription } from '../entity/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(data: CreateSubscriptionInput): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create(data);

    return this.subscriptionRepository.save(subscription);
  }

  findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  findById(id: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    data: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    const subscription = await this.findById(id);

    if (!subscription) {
      throw new NotFoundException('Subscription nao encontrada');
    }

    Object.assign(subscription, data);

    return this.subscriptionRepository.save(subscription);
  }

  async delete(id: string): Promise<Subscription> {
    const subscription = await this.findById(id);

    if (!subscription) {
      throw new NotFoundException('Subscription nao encontrada');
    }

    await this.subscriptionRepository.remove(subscription);

    return subscription;
  }
}
