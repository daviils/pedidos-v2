import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import { UploadService } from '../../../core/services/upload.service';
import { UtilComponent } from '../../../core/util.component';
import {
  CategoriesDocument,
  CreateProductDocument,
  type CreateProductInput,
  ProductDocument,
  UpdateProductDocument,
} from '../../../graphql/generated/graphql';
import { environment } from '../../../../environments/environment';

interface Category {
  id: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  protected product: CreateProductInput = this.createEmptyProduct();
  protected priceFormatted = '';
  protected productId = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected isUploadingPhoto = false;
  protected errorMessage = '';
  protected selectedPhotoFile: File | null = null;
  protected photoTouched = false;
  protected categories: Category[] = [];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
    private readonly uploadService: UploadService,
    private readonly utilComponent: UtilComponent,
  ) {
    this.priceFormatted = this.utilComponent.formatMoney(this.product.price);
  }

  ngOnInit(): void {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    this.loadCategories();

    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  protected submit(form: NgForm): void {
    if (this.isSubmitting || this.isUploadingPhoto) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (!this.product.photoUrl && !this.selectedPhotoFile) {
      this.photoTouched = true;
      return;
    }

    this.saveProduct();
  }

  protected selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedPhotoFile = input.files?.[0] ?? null;
    this.photoTouched = true;

    if (!this.selectedPhotoFile) {
      return;
    }

    this.uploadSelectedPhoto(this.selectedPhotoFile);
  }

  protected formatPrice(value: string): void {
    const { price, priceFormatted } = this.utilComponent.formatPrice(value);
    this.product.price = price;
    this.priceFormatted = priceFormatted;
  }

  protected get productImageUrl(): string {
    return `${environment.productImageBaseUrl}${this.product.photoUrl}`;
  }

  private saveProduct(): void {
    if (this.productId) {
      this.updateProduct();
      return;
    }

    this.createProduct();
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: ProductDocument,
        variables: {
          id,
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          if (!data?.product) {
            this.errorMessage = 'Produto nao encontrado';
            return;
          }

          this.product = {
            title: data.product.title,
            description: data.product.description,
            photoUrl: data.product.photoUrl ?? '',
            price: data.product.price,
            categoryId: data.product.categoryId,
          };
          this.priceFormatted = this.utilComponent.formatMoney(
            data.product.price,
          );
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar o produto';
        },
      });
  }

  private createProduct(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateProductDocument,
        variables: {
          data: {
            title: this.product.title,
            description: this.product.description,
            photoUrl: this.product.photoUrl,
            price: Number(this.product.price),
            categoryId: this.product.categoryId || null,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/product');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar o produto';
        },
      });
  }

  private updateProduct(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: UpdateProductDocument,
        variables: {
          id: this.productId,
          data: {
            title: this.product.title,
            description: this.product.description,
            photoUrl: this.product.photoUrl,
            price: Number(this.product.price),
            categoryId: this.product.categoryId || null,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/product');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel atualizar o produto';
        },
      });
  }

  private uploadSelectedPhoto(file: File): void {
    this.isUploadingPhoto = true;
    this.errorMessage = '';

    this.uploadService
      .uploadProduct(file)
      .pipe(
        take(1),
        finalize(() => (this.isUploadingPhoto = false)),
      )
      .subscribe({
        next: ({ url }) => {
          this.product.photoUrl = url;
        },
        error: () => {
          this.selectedPhotoFile = null;
          this.product.photoUrl = '';
          this.errorMessage = 'Nao foi possivel enviar a imagem do produto';
        },
      });
  }

  private createEmptyProduct(): CreateProductInput {
    return {
      title: '',
      description: '',
      photoUrl: '',
      price: 0,
      categoryId: null,
    };
  }

  private loadCategories(): void {
    this.apollo
      .query({
        query: CategoriesDocument,
      })
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          this.categories = data!.categories;
        },
      });
  }
}
