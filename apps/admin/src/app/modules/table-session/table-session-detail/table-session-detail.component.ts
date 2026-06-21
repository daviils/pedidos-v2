import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import {
  CreateTableSessionDocument,
  type CreateTableSessionInput,
  TableSessionDocument,
  UpdateTableSessionDocument,
  TablesDocument,
  type TablesQuery,
} from '../../../graphql/generated/graphql';

type Table = TablesQuery['tables'][number];

@Component({
  selector: 'app-table-session-detail',
  standalone: false,
  templateUrl: './table-session-detail.component.html',
  styleUrl: './table-session-detail.component.css',
})
export class TableSessionDetailComponent implements OnInit {
  protected session: CreateTableSessionInput = this.createEmptySession();
  protected tables: Table[] = [];
  protected sessionId = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected errorMessage = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTables();

    this.sessionId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.sessionId) {
      this.loadSession(this.sessionId);
    }
  }

  protected submit(form: NgForm): void {
    if (this.isSubmitting) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.saveSession();
  }

  private saveSession(): void {
    if (this.sessionId) {
      this.updateSession();
      return;
    }

    this.createSession();
  }

  private loadTables(): void {
    this.apollo
      .query({ query: TablesDocument })
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          this.tables = data!.tables as Table[];
        },
      });
  }

  private loadSession(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: TableSessionDocument,
        variables: { id },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          if (!data?.tableSession) {
            this.errorMessage = 'Sessao nao encontrada';
            return;
          }

          this.session = {
            tableId: data.tableSession.tableId,
          };
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar a sessao';
        },
      });
  }

  private createSession(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateTableSessionDocument,
        variables: {
          data: {
            tableId: this.session.tableId,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/table-session');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar a sessao';
        },
      });
  }

  private updateSession(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: UpdateTableSessionDocument,
        variables: {
          id: this.sessionId,
          data: {
            tableId: this.session.tableId,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/table-session');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel atualizar a sessao';
        },
      });
  }

  private createEmptySession(): CreateTableSessionInput {
    return {
      tableId: '',
    };
  }
}
