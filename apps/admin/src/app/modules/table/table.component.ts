import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import { StoreService } from '../../core/services/store.service';
import {
  TablesDocument,
  DeleteTableDocument,
  CreateTableSessionDocument,
  type TablesQuery,
} from '../../graphql/generated/graphql';

type Table = TablesQuery['tables'][number];

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit {
  protected tables: Table[] = [];
  protected filter = '';
  protected isLoading = false;
  protected errorMessage = '';
  protected readonly storeService = inject(StoreService);

  constructor(
    private readonly apollo: Apollo,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTables();
  }

  protected get filteredTables(): Table[] {
    const search = this.filter.trim().toLowerCase();
    if (!search) {
      return this.tables;
    }
    return this.tables.filter((table) =>
      [table.name, table.status].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }

  protected onStoreChange(storeId: string): void {
    this.storeService.selectedStoreId.set(storeId);
    this.loadTables();
  }

  protected loadTables(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: TablesDocument,
        variables: { storeId: this.storeService.selectedStoreId() },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          this.tables = data!.tables as Table[];
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar as mesas';
        },
      });
  }

  protected createSession(tableId: string): void {
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateTableSessionDocument,
        variables: {
          data: { tableId },
        },
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/table-session');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar a sessao';
        },
      });
  }

  protected deleteTable(id: string): void {
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: DeleteTableDocument,
        variables: { id },
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.tables = this.tables.filter((t) => t.id !== id);
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel excluir a mesa';
        },
      });
  }
}
