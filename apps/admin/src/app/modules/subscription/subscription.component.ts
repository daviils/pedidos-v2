import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import {
  SubscriptionsDocument,
  type SubscriptionsQuery,
} from '../../graphql/generated/graphql';

type Subscription = SubscriptionsQuery['subscriptions'][number];

@Component({
  selector: 'app-subscription',
  standalone: false,
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css',
})
export class SubscriptionComponent implements OnInit {
  protected subscriptions: Subscription[] = [];
  protected filter = '';
  protected isLoading = false;
  protected errorMessage = '';

  constructor(private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  protected get filteredSubscriptions(): Subscription[] {
    const search = this.filter.trim().toLowerCase();

    if (!search) {
      return this.subscriptions;
    }

    return this.subscriptions.filter((subscription) =>
      [
        subscription.title,
        subscription.description,
        subscription.price.toString(),
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }

  protected loadSubscriptions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: SubscriptionsDocument,
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          this.subscriptions = data!.subscriptions;
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar as subscriptions';
        },
      });
  }
}
