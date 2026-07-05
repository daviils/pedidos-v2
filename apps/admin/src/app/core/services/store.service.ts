import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  readonly storeId = signal<string>('123e4567-e89b-12d3-a456-426614174000');
}
