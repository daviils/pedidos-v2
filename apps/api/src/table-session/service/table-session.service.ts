import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TableService } from '../../table/service/table.service';
import { TableStatus } from '../../table/entity/table.entity';
import { CreateTableSessionInput } from '../dtos/create-table-session.input';
import { UpdateTableSessionInput } from '../dtos/update-table-session.input';
import { TableSession, TableSessionStatus } from '../entity/table-session.entity';

@Injectable()
export class TableSessionService {
  constructor(
    @InjectRepository(TableSession)
    private readonly tableSessionRepository: Repository<TableSession>,
    private readonly tableService: TableService,
  ) {}

  async create(data: CreateTableSessionInput): Promise<TableSession> {
    const table = await this.tableService.findById(data.tableId);

    if (!table) {
      throw new NotFoundException('Mesa nao encontrada');
    }

    if (table.status !== TableStatus.Open) {
      throw new BadRequestException('Mesa precisa estar aberta para criar uma sessao');
    }

    const session = this.tableSessionRepository.create(data);

    return this.tableSessionRepository.save(session);
  }

  findAll(): Promise<TableSession[]> {
    return this.tableSessionRepository.find({ relations: { table: true } });
  }

  findById(id: string): Promise<TableSession | null> {
    return this.tableSessionRepository.findOne({
      where: { id },
      relations: { table: true },
    });
  }

  findByTableId(tableId: string): Promise<TableSession[]> {
    return this.tableSessionRepository.find({
      where: { tableId },
      relations: { table: true },
    });
  }

  async close(id: string): Promise<TableSession> {
    const session = await this.findById(id);

    if (!session) {
      throw new NotFoundException('Sessao de mesa nao encontrada');
    }

    session.status = TableSessionStatus.Closed;
    session.closingDate = new Date();

    return this.tableSessionRepository.save(session);
  }

  async update(id: string, data: UpdateTableSessionInput): Promise<TableSession> {
    const session = await this.findById(id);

    if (!session) {
      throw new NotFoundException('Sessao de mesa nao encontrada');
    }

    Object.assign(session, data);

    return this.tableSessionRepository.save(session);
  }

  async delete(id: string): Promise<TableSession> {
    const session = await this.findById(id);

    if (!session) {
      throw new NotFoundException('Sessao de mesa nao encontrada');
    }

    await this.tableSessionRepository.remove(session);

    return session;
  }
}
