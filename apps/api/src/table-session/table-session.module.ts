import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TableModule } from '../table/table.module';
import { TableSession } from './entity/table-session.entity';
import { TableSessionResolver } from './resolver/table-session.resolver';
import { TableSessionService } from './service/table-session.service';

@Module({
  imports: [TypeOrmModule.forFeature([TableSession]), TableModule],
  providers: [TableSessionResolver, TableSessionService],
  exports: [TableSessionService],
})
export class TableSessionModule {}
