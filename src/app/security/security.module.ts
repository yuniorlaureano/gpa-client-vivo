import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityRoutingModule } from './security-routing.module';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginTemplateComponent } from '../core/login-template/login-template.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserListComponent } from './user-list/user-list.component';
import { UserListTableComponent } from './user-list/user-list-table.component';
import { DataTableComponent } from '../core/datatable/data-table.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileListComponent } from './profile/profile-list.component';
import { ProfilePermissionComponent } from './profile-permission/profile-permission.component';
import { CoreModule } from '../core/core.module';
import { ProfileUserCatalogComponent } from './profile/profile-user-catalog/profile-user-catalog.component';
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TOTPCodeComponent } from './totp-code/totp-code.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InvitationRedentionComponent } from './invitation-redime/invitation-redime.component';
import { InputMaskModule } from '@ngneat/input-mask';

@NgModule({
  declarations: [
    LoginComponent,
    SignUpComponent,
    LoginTemplateComponent,
    UserListComponent,
    UserListTableComponent,
    UserRegisterComponent,
    ProfileComponent,
    ProfileComponent,
    ProfileListComponent,
    ProfilePermissionComponent,
    ProfileUserCatalogComponent,
    UserProfileEditComponent,
    ResetPasswordComponent,
    TOTPCodeComponent,
    InvitationRedentionComponent,
  ],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    CoreModule,
    NgbTooltipModule,
    InputMaskModule,
  ],
})
export class SecurityModule {}
