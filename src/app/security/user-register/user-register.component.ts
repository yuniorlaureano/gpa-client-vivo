import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { UserModel } from '../model/user.model';
import { of, Subscription, switchMap } from 'rxjs';
import { ProfileModel } from '../model/profile.model';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';

@Component({
  selector: 'gpa-user-register',
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css',
})
export class UserRegisterComponent implements OnInit, OnDestroy {
  isEdit: boolean = false;
  profiles: ProfileModel[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadUser();
    this.handlePermissionsLoad();
  }
  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  //form
  userForm = this.fb.group({
    id: [''],
    firstName: ['', Validators.required],
    lastName: ['', [Validators.required]],
    email: ['', Validators.required],
    userName: ['', Validators.required],
  });

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Security][
            PermissionConstants.Components.User
          ]
      )
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
        },
      });
    this.subscriptions$.push(sub);
  }

  setPermissions(requiredPermissions: RequiredPermissionType) {
    this.canRead = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Read
    );
    this.canCreate = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Create
    );
    this.canDelete = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Delete
    );
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  onSubmit() {
    if (this.userForm.valid) {
      if (!this.isEdit) {
        this.creaUser();
      } else {
        this.upateUser();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  creaUser() {
    this.userForm.get('id')?.setValue(null);
    const value = {
      ...this.userForm.value,
    };

    const sub = this.userService.addUser(value as UserModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Usuario agregado');
      },
      error: (error) => {
        this.toastService.showError('Error al agregar usuario. ');
      },
    });
    this.subscriptions$.push(sub);
  }

  upateUser() {
    const value = {
      ...this.userForm.value,
    };

    const sub = this.userService.updateUser(value as UserModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Usuario actualizado');
      },
      error: (err) =>
        this.toastService.showError('Error actualizado usuario. ' + err),
    });
    this.subscriptions$.push(sub);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/auth/users/register']);
  }

  clearForm() {
    this.userForm.reset();
    this.isEdit = false;
  }

  loadUser() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
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
            this.profiles = user.profiles;
          }
        },
        error: (error) => {
          this.toastService.showError('Error cargando usuario. ');
        },
      });
    this.subscriptions$.push(sub);
  }
}
