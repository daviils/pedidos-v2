import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';

import { environment } from '../../../environments/environment';
import { CategoriesDocument, CategoriesQuery } from '../../graphql/generated/graphql';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  categories: CategoriesQuery['categories'] = [];

  constructor(private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo
      .query<CategoriesQuery>({ query: CategoriesDocument })
      .subscribe(({ data }) => {
        if (data) {
          this.categories = data.categories;
        }
      });
  }

  getProductImageUrl(photoUrl: string | null): string {
    return `${environment.productImageBaseUrl}${photoUrl}`;
  }
}
