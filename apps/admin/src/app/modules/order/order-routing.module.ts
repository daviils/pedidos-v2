import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderComponent } from './order.component';

const routes: Routes = [
  {
    path: '',
    component: OrderComponent,
  },
  {
    path: 'create',
    component: OrderDetailComponent,
  },
  {
    path: 'edit/:id',
    component: OrderDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
