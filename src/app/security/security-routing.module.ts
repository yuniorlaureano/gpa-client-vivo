import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LoginTemplateComponent } from '../core/login-template/login-template.component';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfilePermissionComponent } from './profile-permission/profile-permission.component';

const routes: Routes = [
  {
    path: '',
    component: LoginTemplateComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: '',
    component: AdminTemplateComponent,
    children: [
      { path: 'users/list', component: UserListComponent },
      { path: 'users/register', component: UserRegisterComponent },
      { path: 'users/edit/:id', component: UserRegisterComponent },
      { path: 'profiles', component: ProfileComponent },
      {
        path: 'profiles/permissions/:id',
        component: ProfilePermissionComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityRoutingModule {}
