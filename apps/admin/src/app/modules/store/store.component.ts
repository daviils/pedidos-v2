import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import {
  DeleteStoreDocument,
  StoresDocument,
  type StoresQuery,
} from '../../graphql/generated/graphql';

type Store = StoresQuery['stores'][number];

@Component({
  selector: 'app-store',
  standalone: false,
  templateUrl: './store.component.html',
  styleUrl: './store.component.css',
})
export class StoreComponent implements OnInit {
  protected stores: Store[] = [];
  protected filter = '';
  protected isLoading = false;
  protected errorMessage = '';

  constructor(private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.loadStores();
  }

  protected get filteredStores(): Store[] {
    const search = this.filter.trim().toLowerCase();
    if (!search) {
      return this.stores;
    }
    return this.stores.filter((store) =>
      [store.name, store.description, store.phone, store.address].some(
        (value) => value?.toLowerCase().includes(search),
      ),
    );
  }

  protected loadStores(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: StoresDocument,
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          this.stores = data!.stores as Store[];
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar as lojas';
        },
      });
  }

  protected deleteStore(id: string): void {
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: DeleteStoreDocument,
        variables: { id },
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.stores = this.stores.filter((s) => s.id !== id);
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel excluir a loja';
        },
      });
  }
}
