import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUserAdmin } from '../../auth-admin/decorator/current-user-admin.decorator';
import { GqlAuthAdminGuard } from '../../auth-admin/guard/gql-auth-admin.guard';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CreateTableInput } from '../dtos/create-table.input';
import { UpdateTableInput } from '../dtos/update-table.input';
import { Table } from '../entity/table.entity';
import { TableService } from '../service/table.service';

@Resolver(() => Table)
export class TableResolver {
  constructor(private readonly tableService: TableService) {}

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Table)
  createTable(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('storeId', { type: () => String }) storeId: string,
    @Args('data') data: CreateTableInput,
  ): Promise<Table> {
    return this.tableService.create(storeId, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => [Table])
  tables(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('storeId', { type: () => String }) storeId: string,
  ): Promise<Table[]> {
    return this.tableService.findAll(storeId);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Query(() => Table, { nullable: true })
  table(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Table | null> {
    return this.tableService.findById(id);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Table)
  updateTable(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateTableInput,
  ): Promise<Table> {
    return this.tableService.update(id, data);
  }

  @UseGuards(GqlAuthAdminGuard)
  @Mutation(() => Table)
  deleteTable(
    @CurrentUserAdmin() _userAdmin: UserAdmin,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Table> {
    return this.tableService.delete(id);
  }
}
