import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../../modules/home/home.module').then(
            (module) => module.HomeModule,
          ),
      },
      {
        path: 'product',
        loadChildren: () =>
          import('../../modules/product/product.module').then(
            (module) => module.ProductModule,
          ),
      },
      {
        path: 'category',
        loadChildren: () =>
          import('../../modules/category/category.module').then(
            (module) => module.CategoryModule,
          ),
      },
      {
        path: 'subscription',
        loadChildren: () =>
          import('../../modules/subscription/subscription.module').then(
            (module) => module.SubscriptionModule,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
