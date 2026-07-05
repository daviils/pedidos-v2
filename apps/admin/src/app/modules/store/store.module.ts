import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StoreRoutingModule } from './store-routing.module';
import { StoreDetailComponent } from './store-detail/store-detail.component';
import { StoreComponent } from './store.component';

@NgModule({
  declarations: [StoreComponent, StoreDetailComponent],
  imports: [CommonModule, FormsModule, StoreRoutingModule],
})
export class StoreModule {}
