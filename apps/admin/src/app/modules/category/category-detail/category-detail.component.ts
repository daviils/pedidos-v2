import { Component, OnInit, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import { StoreService } from '../../../core/services/store.service';
import {
  CreateCategoryDocument,
  type CreateCategoryInput,
  CategoryDocument,
  UpdateCategoryDocument,
} from '../../../graphql/generated/graphql';

@Component({
  selector: 'app-category-detail',
  standalone: false,
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.css',
})
export class CategoryDetailComponent implements OnInit {
  protected category: CreateCategoryInput = this.createEmptyCategory();
  protected categoryId = '';
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
    this.categoryId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.categoryId) {
      this.loadCategory(this.categoryId);
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

    this.saveCategory();
  }

  private saveCategory(): void {
    if (this.categoryId) {
      this.updateCategory();
      return;
    }

    this.createCategory();
  }

  private loadCategory(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: CategoryDocument,
        variables: { id },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          if (!data?.category) {
            this.errorMessage = 'Categoria nao encontrada';
            return;
          }

          this.category = {
            title: data.category.title,
            description: data.category.description,
          };
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar a categoria';
        },
      });
  }

  private createCategory(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateCategoryDocument,
        variables: {
          storeId: this.storeService.storeId(),
          data: {
            title: this.category.title,
            description: this.category.description,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/category');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar a categoria';
        },
      });
  }

  private updateCategory(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: UpdateCategoryDocument,
        variables: {
          id: this.categoryId,
          data: {
            title: this.category.title,
            description: this.category.description,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/category');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel atualizar a categoria';
        },
      });
  }

  private createEmptyCategory(): CreateCategoryInput {
    return {
      title: '',
      description: '',
    };
  }
}
