import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { UserModel } from '../model/user.model';
import { of, Subscription, switchMap } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';

@Component({
  selector: 'gpa-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrl: './user-profile-edit.component.css',
})
export class UserProfileEditComponent implements OnInit, OnDestroy {
  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  updateUserProfile: boolean = false;

  //form
  userForm = this.fb.group({
    id: [''],
    firstName: ['', Validators.required],
    lastName: ['', [Validators.required]],
    email: ['', Validators.required],
    userName: ['', Validators.required],
  });

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit(): void {
    this.loadUser();
    this.handlePermissionsLoad();
  }

  handlePermissionsLoad() {
    const sub = this.store
      .select((state: any) => {
        return state.app.requiredPermissions[
          PermissionConstants.Modules.General
        ][PermissionConstants.Components.Auth];
      })
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
        },
      });
    this.subscriptions$.push(sub);
  }

  setPermissions(requiredPermissions: RequiredPermissionType) {
    this.updateUserProfile = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.UpdateUserProfile
    );
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.upateUser();
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  upateUser() {
    const value = {
      ...this.userForm.value,
    };

    this.spinner.show('fullscreen');
    const sub = this.authService.editUserProfile(value as UserModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Usuario actualizado');
        this.router.navigate(['/']);
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        this.toastService.showError('Error al actualizar el usuario');
      },
    });
    this.subscriptions$.push(sub);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/']);
  }

  clearForm() {
    this.userForm.reset();
    this.isEdit = false;
  }

  loadUser() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.userService.getUserById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (user) => {
          if (user) {
            this.userForm.setValue({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              userName: user.userName,
            });
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error cargando usuario');
        },
      });
    this.subscriptions$.push(sub);
  }
}
