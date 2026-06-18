import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [MainComponent, SidebarComponent],
  imports: [CommonModule, MainRoutingModule, RouterModule],
})
export class MainModule {}
