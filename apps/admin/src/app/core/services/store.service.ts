import { Injectable, signal } from '@angular/core';

export interface Store {
  id: string;
  userAdminId: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  readonly stores = signal<Store[]>([]);
  readonly selectedStoreId = signal<string>('123e4567-e89b-12d3-a456-426614174000');
}
