import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

interface SidebarRoute {
  path: string;
  label: string;
  icon: string;
  children?: SidebarRoute[];
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() open = false;

  protected readonly expandedSections = new Set<string>();

  protected readonly routes: SidebarRoute[] = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/order', label: 'Pedidos', icon: 'receipt_long' },
    { path: '/table-session', label: 'Sessoes', icon: 'meeting_room' },
    {
      path: '',
      label: 'Configuração',
      icon: 'settings',
      children: [
        { path: '/store', label: 'Lojas', icon: 'store' },
        { path: '/category', label: 'Categorias', icon: 'category' },
        { path: '/product', label: 'Produtos', icon: 'inventory_2' },
        { path: '/table', label: 'Mesas', icon: 'table_restaurant' },
      ],
    },
  ];

  constructor(private readonly router: Router) {
    this.expandedSections.add('Configuração');
  }

  protected toggleSection(label: string): void {
    if (this.expandedSections.has(label)) {
      this.expandedSections.delete(label);
    } else {
      this.expandedSections.add(label);
    }
  }

  protected isActive(path: string): boolean {
    return !!path && (this.router.url === path || this.router.url.startsWith(path + '/'));
  }

  protected isChildActive(children: SidebarRoute[]): boolean {
    return children.some(c => this.isActive(c.path));
  }

  protected logout(): void {
    localStorage.removeItem('accessToken');
    void this.router.navigateByUrl('/login');
  }
}
