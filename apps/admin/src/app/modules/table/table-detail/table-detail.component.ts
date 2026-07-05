import { Component, OnInit, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import { StoreService } from '../../../core/services/store.service';
import {
  CreateTableDocument,
  type CreateTableInput,
  TableDocument,
  UpdateTableDocument,
} from '../../../graphql/generated/graphql';

@Component({
  selector: 'app-table-detail',
  standalone: false,
  templateUrl: './table-detail.component.html',
  styleUrl: './table-detail.component.css',
})
export class TableDetailComponent implements OnInit {
  protected table: CreateTableInput = this.createEmptyTable();
  protected tableId = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected errorMessage = '';
  private readonly storeService = inject(StoreService);

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.tableId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.tableId) {
      this.loadTable(this.tableId);
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

    this.saveTable();
  }

  private saveTable(): void {
    if (this.tableId) {
      this.updateTable();
      return;
    }

    this.createTable();
  }

  private loadTable(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: TableDocument,
        variables: { id },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          if (!data?.table) {
            this.errorMessage = 'Mesa nao encontrada';
            return;
          }

          this.table = {
            name: data.table.name,
          };
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar a mesa';
        },
      });
  }

  private createTable(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateTableDocument,
        variables: {
          storeId: this.storeService.storeId(),
          data: {
            name: this.table.name,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/table');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar a mesa';
        },
      });
  }

  private updateTable(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: UpdateTableDocument,
        variables: {
          id: this.tableId,
          data: {
            name: this.table.name,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/table');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel atualizar a mesa';
        },
      });
  }

  private createEmptyTable(): CreateTableInput {
    return {
      name: '',
    };
  }
}
