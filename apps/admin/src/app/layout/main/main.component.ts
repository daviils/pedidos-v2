import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { take } from 'rxjs';

import { StoreService } from '../../core/services/store.service';
import { MeDocument } from '../../graphql/generated/graphql';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  protected menuOpen = false;

  constructor(
    private readonly apollo: Apollo,
    private readonly router: Router,
    private readonly storeService: StoreService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuOpen = false;
      }
    });
  }

  ngOnInit(): void {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      void this.router.navigateByUrl('/login');
      return;
    }

    this.apollo
      .query({
        query: MeDocument,
      })
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          console.log('Me query result:', data);
        },
        error: () => {
          // localStorage.removeItem('accessToken');
          // void this.router.navigateByUrl('/login');
        },
      });
  }

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  protected closeMenu(): void {
    this.menuOpen = false;
  }
}
