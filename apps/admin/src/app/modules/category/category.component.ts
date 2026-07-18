import { Component, OnInit, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import { StoreService } from '../../core/services/store.service';
import {
  CategoriesDocument,
  DeleteCategoryDocument,
  type CategoriesQuery,
} from '../../graphql/generated/graphql';

type Category = CategoriesQuery['categories'][number];

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  protected categories: Category[] = [];
  protected filter = '';
  protected isLoading = false;
  protected errorMessage = '';
  protected readonly storeService = inject(StoreService);

  constructor(private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  protected get filteredCategories(): Category[] {
    const search = this.filter.trim().toLowerCase();
    if (!search) {
      return this.categories;
    }
    return this.categories.filter((category) =>
      [category.title, category.description].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }

  protected onStoreChange(storeId: string): void {
    this.storeService.selectedStoreId.set(storeId);
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: CategoriesDocument,
        variables: { storeId: this.storeService.selectedStoreId() },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          this.categories = data!.categories as Category[];
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar as categorias';
        },
      });
  }

  protected deleteCategory(id: string): void {
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: DeleteCategoryDocument,
        variables: { id },
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c.id !== id);
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel excluir a categoria';
        },
      });
  }
}
