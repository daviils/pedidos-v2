import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LoginRoutingModule } from './login-routing.module';
import { Login } from './pages/login/login';

@NgModule({
  declarations: [Login],
  imports: [CommonModule, ReactiveFormsModule, LoginRoutingModule],
})
export class LoginModule {}
