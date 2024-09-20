import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginTemplateComponent } from '../core/login-template/login-template.component';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfilePermissionComponent } from './profile-permission/profile-permission.component';
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TOTPCodeComponent } from './totp-code/totp-code.component';
import { InvitationRedentionComponent } from './invitation-redime/invitation-redime.component';

const routes: Routes = [
  {
    path: '',
    component: LoginTemplateComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'totp-code', component: TOTPCodeComponent },
      {
        path: 'invitation-redemption/:token',
        component: InvitationRedentionComponent,
      },
      { path: 'reset-password', component: ResetPasswordComponent },
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
      {
        path: 'users/:id/profile/edit',
        component: UserProfileEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityRoutingModule {}
