import { Component, OnInit, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { take } from 'rxjs';
import { Router } from '@angular/router';

import { StoreService } from '../../core/services/store.service';
import {
  TableSessionsOpenDocument,
  DeleteTableSessionDocument,
  CloseTableSessionDocument,
  TablesDocument,
  type TableSessionsOpenQuery,
  type TablesQuery,
} from '../../graphql/generated/graphql';

type TableSession = TableSessionsOpenQuery['tableSessionsOpen'][number];
type Table = TablesQuery['tables'][number];

@Component({
  selector: 'app-table-session',
  standalone: false,
  templateUrl: './table-session.component.html',
  styleUrl: './table-session.component.css',
})
export class TableSessionComponent implements OnInit {
  protected tableSessions: TableSession[] = [];
  protected tables: Table[] = [];
  protected filter = '';
  protected isLoading = false;
  protected errorMessage = '';
  private readonly storeService = inject(StoreService);

  constructor(
    private readonly apollo: Apollo,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTables();
    this.loadTableSessions();
  }

  protected get filteredTableSessions(): TableSession[] {
    const search = this.filter.trim().toLowerCase();
    if (!search) {
      return this.tableSessions;
    }
    return this.tableSessions.filter((session) => {
      const tableName = session.table?.name?.toLowerCase() ?? '';
      return (
        tableName.includes(search) || session.status.toLowerCase().includes(search)
      );
    });
  }

  protected loadTables(): void {
    this.apollo
      .query({ query: TablesDocument, variables: { storeId: this.storeService.selectedStoreId() } })
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          this.tables = data!.tables as Table[];
        },
      });
  }

  protected loadTableSessions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo.query<any>({ query: TableSessionsOpenDocument }).pipe(take(1)).subscribe({
      next: ({ data }) => {
        this.tableSessions = data.tableSessionsOpen;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nao foi possivel carregar as sessoes de mesa';
        this.isLoading = false;
      },
    });
  }

  protected closeTableSession(id: string): void {
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CloseTableSessionDocument,
        variables: { id },
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.tableSessions = this.tableSessions.map((s) =>
            s.id === id ? { ...s, status: 'Closed', closingDate: new Date().toISOString() as any } : s,
          );
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel fechar a sessao';
        },
      });
  }

  protected goToDetail(id: string): void {
    void this.router.navigateByUrl(`/table-session/${id}`);
  }

  protected formatDate(date: unknown): string {
    if (!date) return '-';
    return new Date(date as string).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected deleteTableSession(id: string): void {
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: DeleteTableSessionDocument,
        variables: { id },
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.tableSessions = this.tableSessions.filter((s) => s.id !== id);
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel excluir a sessao';
        },
      });
  }
}
