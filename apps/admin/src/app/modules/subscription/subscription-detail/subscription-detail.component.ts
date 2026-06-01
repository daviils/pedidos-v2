import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { finalize, take } from 'rxjs';

import {
  CreateSubscriptionDocument,
  type CreateSubscriptionInput,
  SubscriptionDocument,
  UpdateSubscriptionDocument,
} from '../../../graphql/generated/graphql';
import { UtilComponent } from '../../../core/util.component';

@Component({
  selector: 'app-subscription-detail',
  standalone: false,
  templateUrl: './subscription-detail.component.html',
  styleUrl: './subscription-detail.component.css',
})
export class SubscriptionDetailComponent implements OnInit {
  protected subscription: CreateSubscriptionInput =
    this.createEmptySubscription();
  protected priceFormatted = '';
  protected subscriptionId = '';
  protected isLoading = false;
  protected isSubmitting = false;
  protected errorMessage = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly apollo: Apollo,
    private readonly router: Router,
    private readonly utilComponent: UtilComponent,
  ) {
    this.priceFormatted = this.utilComponent.formatMoney(
      this.subscription.price,
    );
  }

  ngOnInit(): void {
    this.subscriptionId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.subscriptionId) {
      this.loadSubscription(this.subscriptionId);
    }
  }

  protected submit(form: NgForm): void {
    if (this.isSubmitting) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.saveSubscription();
  }

  protected formatPrice(value: string): void {
    const { price, priceFormatted } = this.utilComponent.formatPrice(value);
    this.subscription.price = price;
    this.priceFormatted = priceFormatted;
  }

  private saveSubscription(): void {
    if (this.subscriptionId) {
      this.updateSubscription();
      return;
    }

    this.createSubscription();
  }

  private loadSubscription(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apollo
      .query({
        query: SubscriptionDocument,
        variables: {
          id,
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ data }) => {
          if (!data?.subscription) {
            this.errorMessage = 'Subscription nao encontrada';
            return;
          }

          this.subscription = {
            title: data.subscription.title,
            description: data.subscription.description,
            price: data.subscription.price,
          };
          this.priceFormatted = this.utilComponent.formatMoney(
            data.subscription.price,
          );
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar a subscription';
        },
      });
  }

  private createSubscription(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: CreateSubscriptionDocument,
        variables: {
          data: {
            title: this.subscription.title,
            description: this.subscription.description,
            price: Number(this.subscription.price),
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/subscription');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel criar a subscription';
        },
      });
  }

  private updateSubscription(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: UpdateSubscriptionDocument,
        variables: {
          id: this.subscriptionId,
          data: {
            title: this.subscription.title,
            description: this.subscription.description,
            price: Number(this.subscription.price),
          },
        },
      })
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/subscription');
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel atualizar a subscription';
        },
      });
  }

  private createEmptySubscription(): CreateSubscriptionInput {
    return {
      title: '',
      description: '',
      price: 0,
    };
  }
}
