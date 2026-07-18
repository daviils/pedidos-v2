import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription, distinctUntilChanged, finalize, take } from 'rxjs';

import { StoreService } from '../../../core/services/store.service';
import { UploadService } from '../../../core/services/upload.service';
import { UtilComponent } from '../../../core/util.component';
import {
  CategoriesDocument,
  CreateProductDocument,
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
export class ProductDetailComponent implements OnInit, OnDestroy {
  protected productId = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected isUploadingPhoto = false;
  protected errorMessage = '';
  protected selectedPhotoFile: File | null = null;
  protected photoTouched = false;
  protected categories: Category[] = [];
  protected priceFormatted = '';
  protected readonly storeService = inject(StoreService);

  private storeIdSubscription?: Subscription;

  protected readonly form = this.formBuilder.nonNullable.group({
    storeId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    categoryId: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    photoUrl: [''],
  });

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
    private readonly uploadService: UploadService,
    private readonly utilComponent: UtilComponent,
    private readonly formBuilder: FormBuilder,
  ) {
    this.priceFormatted = this.utilComponent.formatMoney(0);
  }

  ngOnInit(): void {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.priceFormatted = this.utilComponent.formatMoney(this.form.getRawValue().price);

    this.storeIdSubscription = this.form.controls.storeId.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(storeId => {
        if (storeId) {
          this.loadCategories(storeId);
          this.form.patchValue({ categoryId: '' });
        }
      });


    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  ngOnDestroy(): void {
    this.storeIdSubscription?.unsubscribe();
  }

  protected submit(): void {
    if (this.isSubmitting || this.isUploadingPhoto) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { photoUrl } = this.form.getRawValue();
    if (!photoUrl && !this.selectedPhotoFile) {
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

  protected onPriceInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const { price, priceFormatted } = this.utilComponent.formatPrice(value);
    this.form.patchValue({ price });
    this.priceFormatted = priceFormatted;
  }

  protected get productImageUrl(): string {
    return `${environment.productImageBaseUrl}${this.form.getRawValue().photoUrl}`;
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
        variables: { id },
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

          this.form.patchValue({
            title: data.product.title,
            description: data.product.description,
            photoUrl: data.product.photoUrl ?? '',
            price: data.product.price,
            categoryId: data.product.categoryId ?? '',
          });
          
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
    const { storeId, title, description, photoUrl, price, categoryId } = this.form.getRawValue();

    this.apollo
      .mutate({
        mutation: CreateProductDocument,
        variables: {
          storeId,
          data: {
            title,
            description,
            photoUrl,
            price: Number(price),
            categoryId: categoryId || null,
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
    const { title, description, photoUrl, price, categoryId } =
      this.form.getRawValue();

    this.apollo
      .mutate({
        mutation: UpdateProductDocument,
        variables: {
          id: this.productId,
          data: {
            title,
            description,
            photoUrl,
            price: Number(price),
            categoryId: categoryId || null,
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
          this.form.patchValue({ photoUrl: url });
        },
        error: () => {
          this.selectedPhotoFile = null;
          this.form.patchValue({ photoUrl: '' });
          this.errorMessage = 'Nao foi possivel enviar a imagem do produto';
        },
      });
  }

  private loadCategories(storeId: string): void {
    this.apollo
      .query({
        query: CategoriesDocument,
        variables: { storeId },
      })
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          this.categories = data!.categories;
        },
      });
  }
}
