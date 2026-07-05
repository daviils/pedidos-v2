import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  protected sidebarCollapsed = false;

  constructor(
    private readonly apollo: Apollo,
    private readonly router: Router,
    private readonly storeService: StoreService,
  ) {}

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
          localStorage.removeItem('accessToken');
          void this.router.navigateByUrl('/login');
        },
      });
  }
}
