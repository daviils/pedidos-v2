import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OpenRouteServiceService } from '../../open-route-service/service/open-route-service.service';
import { CreateUserAddressInput } from '../dtos/create-user-address.input';
import { UpdateUserAddressInput } from '../dtos/update-user-address.input';
import { UserAddress } from '../entity/user-address.entity';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
    private readonly openRouteServiceService: OpenRouteServiceService,
  ) {}

  async create(
    userId: string,
    data: CreateUserAddressInput,
  ): Promise<UserAddress> {
    const coordinates = await this.geocodeAddress(data);
    const userAddress = this.userAddressRepository.create({
      ...data,
      ...coordinates,
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
    Object.assign(userAddress, await this.geocodeAddress(userAddress));

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

  private async geocodeAddress(
    address: Pick<
      UserAddress,
      'street' | 'number' | 'neighborhood' | 'city' | 'state' | 'zipCode'
    >,
  ): Promise<Pick<UserAddress, 'latitude' | 'longitude'>> {
    const geocode = await this.openRouteServiceService.geocodeAddress(
      this.formatAddress(address),
    );

    return {
      latitude: geocode.latitude,
      longitude: geocode.longitude,
    };
  }

  private formatAddress(
    address: Pick<
      UserAddress,
      'street' | 'number' | 'neighborhood' | 'city' | 'state' | 'zipCode'
    >,
  ): string {
    return [
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode,
    ]
      .filter(Boolean)
      .join(', ');
  }
}
