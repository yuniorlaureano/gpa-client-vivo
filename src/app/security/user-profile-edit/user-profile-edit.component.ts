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
import { processError } from '../../core/utils/error.utils';
import { RefreshCredentials } from '../../core/ng-xs-store/actions/app.actions';

@Component({
  selector: 'gpa-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrl: './user-profile-edit.component.css',
})
export class UserProfileEditComponent implements OnInit, OnDestroy {
  isEdit: boolean = false;
  imageUrl: string | ArrayBuffer | null =
    'assets/images/default-placeholder.png';
  photo: File | null = null;

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
  uploadPhoto: boolean = false;

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
    this.handlePermissionsLoad(() => {
      this.loadUser();
    });
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select((state: any) => {
        return state.app.requiredPermissions[
          PermissionConstants.Modules.General
        ][PermissionConstants.Components.Auth];
      })
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
          onPermissionLoad();
        },
      });
    this.subscriptions$.push(sub);
  }

  setPermissions(requiredPermissions: RequiredPermissionType) {
    this.updateUserProfile = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.UpdateUserProfile
    );
    this.uploadPhoto = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Upload
    );
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.updateUser();
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  processFileUpload(event: Event) {
    const fileElement = event.currentTarget as HTMLInputElement;
    this.photo = fileElement.files ? fileElement.files[0] : null;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageUrl = reader.result;
    };
    if (this.photo) {
      reader.readAsDataURL(this.photo);
    } else {
      this.imageUrl = 'assets/images/default-placeholder.png';
    }

    //automaticaly upload the file if the product is being edited
    this.uploadFIleOnUpdate();
  }

  uploadFIleOnUpdate() {
    if (this.isEdit && this.userForm.get('id')?.value) {
      this.spinner.show('fullscreen');
      this.uploadFile(this.userForm.get('id')?.value!, () => {
        this.toastService.showSucess('Foto actualizada');
        this.spinner.hide('fullscreen');
        this.store.dispatch(new RefreshCredentials());
      });
    }
  }

  uploadFile(userId: string, func: () => void) {
    if (this.photo) {
      const formData = new FormData();
      formData.append('photo', this.photo);
      const sub = this.authService.uploadPhoto(userId, formData).subscribe({
        next: () => {
          func();
        },
        error: () => {
          func();
        },
      });
      this.subscriptions$.push(sub);
    }
  }

  updateUser() {
    const value = {
      ...this.userForm.value,
    };

    this.spinner.show('fullscreen');
    const sub = this.authService.editUserProfile(value as UserModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Usuario actualizado');
        this.store.dispatch(new RefreshCredentials());
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(
          error.error || error,
          'Error actualizando usuario'
        ).forEach((err) => {
          this.toastService.showError(err);
        });
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

  setPhoto(photo: string | null) {
    if (photo) {
      try {
        var fileUrl = JSON.parse(photo).fileUrl;
        this.imageUrl = fileUrl;
      } catch {}
    }
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
            this.setPhoto(user.photo);
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error || error, 'Error cargando usuario').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }
}
