import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import { StoreService } from '../../../core/services/store.service';
import {
  CreateTableDocument,
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
  protected tableId = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected errorMessage = '';
  protected readonly storeService = inject(StoreService);

  protected readonly form = this.formBuilder.nonNullable.group({
    storeId: ['', [Validators.required]],
    name: ['', [Validators.required]],
  });

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.tableId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.tableId) {
      this.loadTable(this.tableId);
    }
  }

  protected submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
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

          this.form.patchValue({
            name: data.table.name,
          });
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar a mesa';
        },
      });
  }

  private createTable(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    const { storeId, name } = this.form.getRawValue();

    this.apollo
      .mutate({
        mutation: CreateTableDocument,
        variables: {
          storeId,
          data: { name },
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
    const { name } = this.form.getRawValue();

    this.apollo
      .mutate({
        mutation: UpdateTableDocument,
        variables: {
          id: this.tableId,
          data: { name },
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
}
