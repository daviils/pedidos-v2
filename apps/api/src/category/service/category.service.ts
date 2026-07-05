import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryInput } from '../dtos/create-category.input';
import { UpdateCategoryInput } from '../dtos/update-category.input';
import { Category } from '../entity/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(storeId: string, data: CreateCategoryInput): Promise<Category> {
    const category = this.categoryRepository.create({
      ...data,
      storeId,
    });

    return this.categoryRepository.save(category);
  }

  findAll(storeId: string): Promise<Category[]> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .where('category.storeId = :storeId', { storeId })
      .getMany();
  }

  findById(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    const category = await this.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria nao encontrada');
    }

    Object.assign(category, data);

    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<Category> {
    const category = await this.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria nao encontrada');
    }

    await this.categoryRepository.softRemove(category);

    return category;
  }
}
