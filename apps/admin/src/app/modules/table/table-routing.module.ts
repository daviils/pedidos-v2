import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TableDetailComponent } from './table-detail/table-detail.component';
import { TableComponent } from './table.component';

const routes: Routes = [
  {
    path: '',
    component: TableComponent,
  },
  {
    path: 'create',
    component: TableDetailComponent,
  },
  {
    path: 'edit/:id',
    component: TableDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TableRoutingModule {}
