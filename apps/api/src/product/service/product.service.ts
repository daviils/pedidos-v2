import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductInput } from '../dtos/create-product.input';
import { UpdateProductInput } from '../dtos/update-product.input';
import { Product } from '../entity/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(data: CreateProductInput): Promise<Product> {
    const product = this.productRepository.create({
      ...data,
      photoUrl: this.getImageName(data.photoUrl),
    });

    return this.productRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  findById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const product = await this.findById(id);

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    Object.assign(product, data);

    if (data.photoUrl) {
      product.photoUrl = this.getImageName(data.photoUrl);
    }

    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<Product> {
    const product = await this.findById(id);

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    await this.productRepository.remove(product);

    return product;
  }

  private getImageName(photoUrl: string): string {
    const imagePath = photoUrl.split('?')[0];

    return imagePath.split('/').pop() ?? imagePath;
  }
}
