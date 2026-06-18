import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

interface SidebarRoute {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Output() collapsedChange = new EventEmitter<boolean>();

  protected collapsed = false;

  protected readonly routes: SidebarRoute[] = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/product', label: 'Produtos', icon: 'inventory_2' },
    { path: '/category', label: 'Categorias', icon: 'category' },
    { path: '/subscription', label: 'Assinaturas', icon: 'subscriptions' },
    { path: '/table', label: 'Mesas', icon: 'table_restaurant' },
  ];

  constructor(private readonly router: Router) {}

  protected isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  protected toggle(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  protected logout(): void {
    localStorage.removeItem('accessToken');
    void this.router.navigateByUrl('/login');
  }
}
