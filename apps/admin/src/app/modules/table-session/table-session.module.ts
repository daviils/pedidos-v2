import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TableSessionDetailComponent } from './table-session-detail/table-session-detail.component';
import { TableSessionRoutingModule } from './table-session-routing.module';
import { TableSessionComponent } from './table-session.component';

@NgModule({
  declarations: [TableSessionComponent, TableSessionDetailComponent],
  imports: [CommonModule, FormsModule, TableSessionRoutingModule],
})
export class TableSessionModule {}
