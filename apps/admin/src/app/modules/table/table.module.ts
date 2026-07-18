import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TableDetailComponent } from './table-detail/table-detail.component';
import { TableRoutingModule } from './table-routing.module';
import { TableComponent } from './table.component';

@NgModule({
  declarations: [TableComponent, TableDetailComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableRoutingModule],
})
export class TableModule {}
