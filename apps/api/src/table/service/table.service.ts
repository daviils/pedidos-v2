import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTableInput } from '../dtos/create-table.input';
import { UpdateTableInput } from '../dtos/update-table.input';
import { Table } from '../entity/table.entity';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async create(data: CreateTableInput): Promise<Table> {
    const table = this.tableRepository.create(data);

    return this.tableRepository.save(table);
  }

  findAll(): Promise<Table[]> {
    return this.tableRepository.find();
  }

  findById(id: string): Promise<Table | null> {
    return this.tableRepository.findOne({ where: { id } });
  }

  async update(id: string, data: UpdateTableInput): Promise<Table> {
    const table = await this.findById(id);

    if (!table) {
      throw new NotFoundException('Mesa nao encontrada');
    }

    Object.assign(table, data);

    return this.tableRepository.save(table);
  }

  async delete(id: string): Promise<Table> {
    const table = await this.findById(id);

    if (!table) {
      throw new NotFoundException('Mesa nao encontrada');
    }

    await this.tableRepository.softRemove(table);

    return table;
  }
}
