import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

@NgModule({
  declarations: [ProductComponent, ProductDetailComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProductRoutingModule],
})
export class ProductModule {}
