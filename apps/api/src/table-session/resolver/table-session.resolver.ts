import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { CreateTableSessionInput } from '../dtos/create-table-session.input';
import { UpdateTableSessionInput } from '../dtos/update-table-session.input';
import { TableSession } from '../entity/table-session.entity';
import { TableSessionService } from '../service/table-session.service';

@Resolver(() => TableSession)
export class TableSessionResolver {
  constructor(private readonly tableSessionService: TableSessionService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => TableSession)
  createTableSession(
    @Args('data') data: CreateTableSessionInput,
  ): Promise<TableSession> {
    return this.tableSessionService.create(data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => [TableSession])
  tableSessions(): Promise<TableSession[]> {
    return this.tableSessionService.findAll();
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => [TableSession])
  tableSessionsOpen(): Promise<TableSession[]> {
    return this.tableSessionService.findOpen();
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => TableSession, { nullable: true })
  tableSession(
    @Args('id', { type: () => String }) id: string,
  ): Promise<TableSession | null> {
    return this.tableSessionService.findById(id);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => [TableSession])
  tableSessionsByTable(
    @Args('tableId', { type: () => String }) tableId: string,
  ): Promise<TableSession[]> {
    return this.tableSessionService.findByTableId(tableId);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => TableSession)
  closeTableSession(
    @Args('id', { type: () => String }) id: string,
  ): Promise<TableSession> {
    return this.tableSessionService.close(id);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => TableSession)
  updateTableSession(
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateTableSessionInput,
  ): Promise<TableSession> {
    return this.tableSessionService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => TableSession)
  deleteTableSession(
    @Args('id', { type: () => String }) id: string,
  ): Promise<TableSession> {
    return this.tableSessionService.delete(id);
  }
}
