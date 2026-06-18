import { Component } from '@angular/core';
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
  protected readonly routes: SidebarRoute[] = [
    { path: '/home', label: 'Home', icon: 'home' },
  ];

  constructor(private readonly router: Router) {}

  protected isActive(path: string): boolean {
    return this.router.url === path;
  }

  protected logout(): void {
    localStorage.removeItem('accessToken');
    void this.router.navigateByUrl('/login');
  }
}
