import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CategoryRoutingModule } from './category-routing.module';
import { CategoryDetailComponent } from './category-detail/category-detail.component';
import { CategoryComponent } from './category.component';

@NgModule({
  declarations: [CategoryComponent, CategoryDetailComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CategoryRoutingModule],
})
export class CategoryModule {}
