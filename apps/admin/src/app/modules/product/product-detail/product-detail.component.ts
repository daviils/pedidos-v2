import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import {
  CreateProductDocument,
  type CreateProductInput,
  ProductDocument,
  UpdateProductDocument,
} from '../../../graphql/generated/graphql';
import { UtilComponent } from '../../../core/util.component';

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
  protected errorMessage = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
    private readonly utilComponent: UtilComponent,
  ) {
    this.priceFormatted = this.utilComponent.formatMoney(this.product.price);
  }

  ngOnInit(): void {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.productId) {
      this.loadProduct(this.productId);
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

    this.saveProduct();
  }

  protected formatPrice(value: string): void {
    const { price, priceFormatted } = this.utilComponent.formatPrice(value);
    this.product.price = price;
    this.priceFormatted = priceFormatted;
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
            price: data.product.price,
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
            price: Number(this.product.price),
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
            price: Number(this.product.price),
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

  private createEmptyProduct(): CreateProductInput {
    return {
      title: '',
      description: '',
      price: 0,
    };
  }
}
