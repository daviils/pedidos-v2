import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import {
  CreateStoreDocument,
  type CreateStoreInput,
  StoreDocument,
  UpdateStoreDocument,
} from '../../../graphql/generated/graphql';

@Component({
  selector: 'app-store-detail',
  standalone: false,
  templateUrl: './store-detail.component.html',
  styleUrl: './store-detail.component.css',
})
export class StoreDetailComponent implements OnInit {
  protected store: CreateStoreInput = this.createEmptyStore();
  protected storeId = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected errorMessage = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.storeId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.storeId) {
      this.loadStore(this.storeId);
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

    this.saveStore();
  }

  private saveStore(): void {
    if (this.storeId) {
      this.updateStore();
      return;
    }

    this.createStore();
  }

  private loadStore(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: StoreDocument,
        variables: { id },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          if (!data?.store) {
            this.errorMessage = 'Loja nao encontrada';
            return;
          }

          this.store = {
            name: data.store.name,
            description: data.store.description,
            phone: data.store.phone,
            address: data.store.address,
            isActive: data.store.isActive,
          };
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar a loja';
        },
      });
  }

  private createStore(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateStoreDocument,
        variables: {
          data: {
            name: this.store.name,
            description: this.store.description,
            phone: this.store.phone,
            address: this.store.address,
            isActive: this.store.isActive,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/store');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar a loja';
        },
      });
  }

  private updateStore(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: UpdateStoreDocument,
        variables: {
          id: this.storeId,
          data: {
            name: this.store.name,
            description: this.store.description,
            phone: this.store.phone,
            address: this.store.address,
            isActive: this.store.isActive,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/store');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel atualizar a loja';
        },
      });
  }

  private createEmptyStore(): CreateStoreInput {
    return {
      name: '',
      description: '',
      phone: '',
      address: '',
      isActive: true,
    };
  }
}
