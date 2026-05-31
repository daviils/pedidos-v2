import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilComponent {
  formatPrice(value: string): { price: number; priceFormatted: string } {
    const cents = Number(value.replace(/\D/g, ''));
    const price = cents / 100;

    return {
      price,
      priceFormatted: this.formatMoney(price),
    };
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
