import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { CreateTableInput } from '../dtos/create-table.input';
import { UpdateTableInput } from '../dtos/update-table.input';
import { Table } from '../entity/table.entity';
import { TableService } from '../service/table.service';

@Resolver(() => Table)
export class TableResolver {
  constructor(private readonly tableService: TableService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Table)
  createTable(@Args('data') data: CreateTableInput): Promise<Table> {
    return this.tableService.create(data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => [Table])
  tables(): Promise<Table[]> {
    return this.tableService.findAll();
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => Table, { nullable: true })
  table(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Table | null> {
    return this.tableService.findById(id);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Table)
  updateTable(
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateTableInput,
  ): Promise<Table> {
    return this.tableService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Table)
  deleteTable(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Table> {
    return this.tableService.delete(id);
  }
}
