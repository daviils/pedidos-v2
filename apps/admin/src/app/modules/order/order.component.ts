import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import {
  OrdersDocument,
  DeleteOrderDocument,
  type OrdersQuery,
} from '../../graphql/generated/graphql';

type Order = OrdersQuery['orders'][number];

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  protected orders: Order[] = [];
  protected filter = '';
  protected isLoading = false;
  protected errorMessage = '';

  constructor(private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  protected get filteredOrders(): Order[] {
    const search = this.filter.trim().toLowerCase();

    if (!search) {
      return this.orders;
    }

    return this.orders.filter((order) =>
      [order.table.name, order.id].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }

  protected loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: OrdersDocument,
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          this.orders = data!.orders;
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar os pedidos';
        },
      });
  }

  protected deleteOrder(id: string): void {
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: DeleteOrderDocument,
        variables: { id },
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.orders = this.orders.filter((o) => o.id !== id);
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel excluir o pedido';
        },
      });
  }

  protected getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'Pendente',
      Confirmed: 'Confirmado',
      Preparing: 'Preparando',
      Done: 'Pronto',
      Cancelled: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  protected getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Pending: 'text-warning',
      Confirmed: 'text-info',
      Preparing: 'text-primary',
      Done: 'text-success',
      Cancelled: 'text-danger',
    };
    return classes[status] ?? '';
  }

  protected getTotal(items: Order['items']): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  protected formatDate(value: unknown): string {
    if (!value) {
      return '-';
    }
    const date = new Date(value as string);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
