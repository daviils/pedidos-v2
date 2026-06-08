import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OpenRouteServiceService } from '../../open-route-service/service/open-route-service.service';
import { CreateUserAdminAddressInput } from '../dtos/create-user-admin-address.input';
import { UpdateUserAdminAddressInput } from '../dtos/update-user-admin-address.input';
import { UserAdminAddress } from '../entity/user-admin-address.entity';

@Injectable()
export class UserAdminAddressService {
  constructor(
    @InjectRepository(UserAdminAddress)
    private readonly userAdminAddressRepository: Repository<UserAdminAddress>,
    private readonly openRouteServiceService: OpenRouteServiceService,
  ) {}

  async create(
    userAdminId: string,
    data: CreateUserAdminAddressInput,
  ): Promise<UserAdminAddress> {
    const coordinates = await this.geocodeAddress(data);
    const userAdminAddress = this.userAdminAddressRepository.create({
      ...data,
      ...coordinates,
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
    Object.assign(userAdminAddress, await this.geocodeAddress(userAdminAddress));

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

  private async geocodeAddress(
    address: Pick<
      UserAdminAddress,
      'street' | 'number' | 'neighborhood' | 'city' | 'state' | 'zipCode'
    >,
  ): Promise<Pick<UserAdminAddress, 'latitude' | 'longitude'>> {
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
      UserAdminAddress,
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
