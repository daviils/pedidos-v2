import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { OrderRoutingModule } from './order-routing.module';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderComponent } from './order.component';

@NgModule({
  declarations: [OrderComponent, OrderDetailComponent],
  imports: [CommonModule, FormsModule, OrderRoutingModule],
})
export class OrderModule {}
