import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityRoutingModule } from './security-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LoginTemplateComponent } from '../core/login-template/login-template.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserListComponent } from './user-list/user-list.component';
import { UserListTableComponent } from './user-list/user-list-table.component';
import { DataTableComponent } from '../core/datatable/data-table.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileListComponent } from './profile/profile-list.component';
import { ProfilePermissionComponent } from './profile-permission/profile-permission.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    LoginTemplateComponent,
    UserListComponent,
    UserListTableComponent,
    UserRegisterComponent,
    ProfileComponent,
    ProfileComponent,
    ProfileListComponent,
    ProfilePermissionComponent,
  ],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
  ],
})
export class SecurityModule {}
