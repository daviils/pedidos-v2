import { Component, OnInit, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import { StoreService } from '../../../core/services/store.service';
import {
  CreateOrderDocument,
  type CreateOrderInput,
  OrderDocument,
  TableSessionsOpenDocument,
  ProductsDocument,
  UpdateOrderDocument,
  type TableSessionsOpenQuery,
  type ProductsQuery,
} from '../../../graphql/generated/graphql';

type TableSession = TableSessionsOpenQuery['tableSessionsOpen'][number];
type Product = ProductsQuery['products'][number];

interface OrderItemForm {
  productId: string;
  quantity: number;
}

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  protected order: CreateOrderInput = this.createEmptyOrder();
  protected orderId = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected errorMessage = '';
  protected tableSessions: TableSession[] = [];
  protected products: Product[] = [];
  private readonly storeService = inject(StoreService);

  protected readonly statusOptions = [
    { value: 'Pending', label: 'Pendente' },
    { value: 'Confirmed', label: 'Confirmado' },
    { value: 'Preparing', label: 'Preparando' },
    { value: 'Done', label: 'Pronto' },
    { value: 'Cancelled', label: 'Cancelado' },
  ];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.orderId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    this.loadTableSessions();
    this.loadProducts();

    if (this.orderId) {
      this.loadOrder(this.orderId);
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

    if (this.order.items.length === 0) {
      this.errorMessage = 'Adicione pelo menos um item ao pedido';
      return;
    }

    this.saveOrder();
  }

  protected addItem(): void {
    this.order.items.push({ productId: '', quantity: 1 });
  }

  protected removeItem(index: number): void {
    this.order.items.splice(index, 1);
  }

  protected getProductPrice(productId: string): number {
    const product = this.products.find((p) => p.id === productId);
    return product?.price ?? 0;
  }

  protected getProductTitle(productId: string): string {
    const product = this.products.find((p) => p.id === productId);
    return product?.title ?? '';
  }

  protected getItemTotal(quantity: number, productId: string): number {
    return quantity * this.getProductPrice(productId);
  }

  protected get orderTotal(): number {
    return this.order.items.reduce(
      (sum, item) => sum + item.quantity * this.getProductPrice(item.productId),
      0,
    );
  }

  private saveOrder(): void {
    if (this.orderId) {
      this.updateOrder();
      return;
    }

    this.createOrder();
  }

  private loadOrder(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: OrderDocument,
        variables: { id },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          if (!data?.order) {
            this.errorMessage = 'Pedido nao encontrado';
            return;
          }

          this.order = {
            tableSessionId: data.order.tableSessionId,
            status: data.order.status,
            items: data.order.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          };
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar o pedido';
        },
      });
  }

  private createOrder(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateOrderDocument,
        variables: {
          data: {
            tableSessionId: this.order.tableSessionId,
            status: this.order.status,
            items: this.order.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/order');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar o pedido';
        },
      });
  }

  private updateOrder(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: UpdateOrderDocument,
        variables: {
          id: this.orderId,
          data: {
            tableSessionId: this.order.tableSessionId,
            status: this.order.status,
            items: this.order.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/order');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel atualizar o pedido';
        },
      });
  }

  private loadTableSessions(): void {
    this.apollo
      .query({
        query: TableSessionsOpenDocument,
      })
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          this.tableSessions = data!.tableSessionsOpen;
        },
      });
  }

  private loadProducts(): void {
    this.apollo
      .query({
        query: ProductsDocument,
        variables: { storeId: this.storeService.storeId() },
      })
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          this.products = data!.products;
        },
      });
  }

  private createEmptyOrder(): CreateOrderInput {
    return {
      tableSessionId: '',
      status: 'Pending',
      items: [],
    };
  }
}
