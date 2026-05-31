import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import {
  ProductsDocument,
  type ProductsQuery,
} from '../../graphql/generated/graphql';
import { environment } from '../../../environments/environment';

type Product = ProductsQuery['products'][number];

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  protected products: Product[] = [];
  protected filter = '';
  protected isLoading = false;
  protected errorMessage = '';

  constructor(private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  protected get filteredProducts(): Product[] {
    const search = this.filter.trim().toLowerCase();

    if (!search) {
      return this.products;
    }

    return this.products.filter((product) =>
      [
        product.title,
        product.description,
        product.price.toString(),
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }

  protected loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: ProductsDocument,
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          this.products = data!.products;
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar os produtos';
        },
      });
  }

  protected getProductImageUrl(photoUrl: string): string {
    return `${environment.productImageBaseUrl}${photoUrl}`;
  }
}
