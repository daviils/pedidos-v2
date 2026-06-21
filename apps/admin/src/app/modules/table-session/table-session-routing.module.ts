import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TableSessionDetailComponent } from './table-session-detail/table-session-detail.component';
import { TableSessionComponent } from './table-session.component';

const routes: Routes = [
  {
    path: '',
    component: TableSessionComponent,
  },
  {
    path: 'create',
    component: TableSessionDetailComponent,
  },
  {
    path: 'edit/:id',
    component: TableSessionDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TableSessionRoutingModule {}
