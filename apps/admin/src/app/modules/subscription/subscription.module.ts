import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SubscriptionDetailComponent } from './subscription-detail/subscription-detail.component';
import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SubscriptionComponent } from './subscription.component';

@NgModule({
  declarations: [SubscriptionComponent, SubscriptionDetailComponent],
  imports: [CommonModule, FormsModule, SubscriptionRoutingModule],
})
export class SubscriptionModule {}
