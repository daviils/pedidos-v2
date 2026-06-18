import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Table } from './entity/table.entity';
import { TableResolver } from './resolver/table.resolver';
import { TableService } from './service/table.service';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  providers: [TableResolver, TableService],
  exports: [TableService],
})
export class TableModule {}
