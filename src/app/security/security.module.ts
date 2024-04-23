import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityRoutingModule } from './security-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LoginTemplateComponent } from '../core/login-template/login-template.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, LoginTemplateComponent],
  imports: [CommonModule, SecurityRoutingModule],
})
export class SecurityModule {}
