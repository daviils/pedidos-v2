import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StoreDetailComponent } from './store-detail/store-detail.component';
import { StoreComponent } from './store.component';

const routes: Routes = [
  {
    path: '',
    component: StoreComponent,
  },
  {
    path: 'create',
    component: StoreDetailComponent,
  },
  {
    path: 'edit/:id',
    component: StoreDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreRoutingModule {}
