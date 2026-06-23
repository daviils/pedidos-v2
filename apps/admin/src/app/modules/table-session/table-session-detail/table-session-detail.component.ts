import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import {
  CloseTableSessionDocument,
  CreateTableSessionDocument,
  type CreateTableSessionInput,
  OrdersByTableSessionDocument,
  TableSessionDocument,
  UpdateTableSessionDocument,
  TablesDocument,
  type TablesQuery,
  type OrdersByTableSessionQuery,
} from '../../../graphql/generated/graphql';

type Table = TablesQuery['tables'][number];
type Order = OrdersByTableSessionQuery['ordersByTableSession'][number];

interface OrderItemRow {
  orderId: string;
  orderStatus: string;
  createdAt: unknown;
  productTitle: string;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-table-session-detail',
  standalone: false,
  templateUrl: './table-session-detail.component.html',
  styleUrl: './table-session-detail.component.css',
})
export class TableSessionDetailComponent implements OnInit {
  protected session: CreateTableSessionInput = this.createEmptySession();
  protected tables: Table[] = [];
  protected sessionId = '';
  protected sessionStatus = '';
  protected openingDate: unknown = null;
  protected tableName = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected isClosing = false;
  protected errorMessage = '';
  protected orders: Order[] = [];
  protected ordersLoading = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTables();

    this.sessionId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.sessionId) {
      this.loadSession(this.sessionId);
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

    this.saveSession();
  }

  private saveSession(): void {
    if (this.sessionId) {
      this.updateSession();
      return;
    }

    this.createSession();
  }

  private loadTables(): void {
    this.apollo
      .query({ query: TablesDocument })
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          this.tables = data!.tables as Table[];
        },
      });
  }

  private loadSession(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: TableSessionDocument,
        variables: { id },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          if (!data?.tableSession) {
            this.errorMessage = 'Sessao nao encontrada';
            return;
          }

          this.session = {
            tableId: data.tableSession.tableId,
          };
          this.sessionStatus = data.tableSession.status;
          this.openingDate = data.tableSession.openingDate;
          this.tableName = data.tableSession.table?.name ?? '';
          this.loadOrders();
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar a sessao';
        },
      });
  }

  private createSession(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateTableSessionDocument,
        variables: {
          data: {
            tableId: this.session.tableId,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/table-session');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar a sessao';
        },
      });
  }

  private updateSession(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: UpdateTableSessionDocument,
        variables: {
          id: this.sessionId,
          data: {
            tableId: this.session.tableId,
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/table-session');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel atualizar a sessao';
        },
      });
  }

  protected closeSession(): void {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CloseTableSessionDocument,
        variables: { id: this.sessionId },
      })
      .pipe(
        take(1),
        finalize(() => (this.isClosing = false)),
      )
      .subscribe({
        next: () => {
          this.sessionStatus = 'Closed';
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel fechar a sessao';
        },
      });
  }

  private createEmptySession(): CreateTableSessionInput {
    return {
      tableId: '',
    };
  }

  private loadOrders(): void {
    this.ordersLoading = true;

    this.apollo
      .query({
        query: OrdersByTableSessionDocument,
        variables: { tableSessionId: this.sessionId },
      })
      .pipe(
        take(1),
        finalize(() => (this.ordersLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          this.orders = data!.ordersByTableSession;
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
      Pending: 'badge bg-warning text-dark',
      Confirmed: 'badge bg-info text-dark',
      Preparing: 'badge bg-primary text-white',
      Done: 'badge bg-success text-white',
      Cancelled: 'badge bg-danger text-white',
    };
    return classes[status] ?? 'badge bg-secondary text-white';
  }

  protected get orderItems(): OrderItemRow[] {
    const rows: OrderItemRow[] = [];

    for (const order of this.orders) {
      for (const item of order.items) {
        rows.push({
          orderId: order.id,
          orderStatus: order.status,
          createdAt: order.createdAt,
          productTitle: item.product.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }
    }

    return rows;
  }

  protected get ordersTotal(): number {
    return this.orderItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
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

  protected downloadPdf(): void {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Sessao - ${this.tableName}`, 14, 22);

    doc.setFontSize(10);
    doc.text(`Aberta em: ${this.formatDate(this.openingDate)}`, 14, 30);
    doc.text(`Status: ${this.sessionStatus === 'Open' ? 'Aberta' : 'Fechada'}`, 14, 36);

    const rows = this.orderItems.map((item) => [
      this.getStatusLabel(item.orderStatus),
      item.productTitle,
      String(item.quantity),
      `R$ ${item.unitPrice.toFixed(2)}`,
      `R$ ${(item.quantity * item.unitPrice).toFixed(2)}`,
      this.formatDate(item.createdAt),
    ]);

    (doc as any).autoTable({
      head: [['Status', 'Produto', 'Qtd', 'Preco unit.', 'Subtotal', 'Criado em']],
      body: rows,
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Total geral: R$ ${this.ordersTotal.toFixed(2)}`, 14, finalY);

    doc.save(`sessao-${this.tableName || this.sessionId}.pdf`);
  }
}
