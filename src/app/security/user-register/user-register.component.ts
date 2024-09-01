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
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-user-register',
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css',
})
export class UserRegisterComponent implements OnInit, OnDestroy {
  isEdit: boolean = false;
  profiles: ProfileModel[] = [];
  imageUrl: string | ArrayBuffer | null =
    'assets/images/default-placeholder.png';
  photo: File | null = null;
  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;
  uploadPhoto: boolean = true;

  //form
  userForm = this.fb.group({
    id: [''],
    firstName: ['', Validators.required],
    lastName: ['', [Validators.required]],
    email: ['', Validators.required],
    userName: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private store: Store,
    private spinner: NgxSpinnerService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadUser();
    this.handlePermissionsLoad();
  }

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
    this.uploadPhoto = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Upload
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
    this.spinner.show('fullscreen');
    const sub = this.userService.addUser(value as UserModel).subscribe({
      next: (user) => {
        this.uploadFile(user.id!, (hasError) => {
          if (hasError) {
            this.toastService.showError('No se pudo agregar la foto. ');
          }
          this.toastService.showSucess('Usuario agregado');
          this.spinner.hide('fullscreen');
          this.clearForm();
        });
      },
      error: (error) => {
        processError(error.error).forEach((err) => {
          this.toastService.showError(err);
        });
        this.spinner.hide('fullscreen');
        processError(error.error).forEach((err) => {
          this.toastService.showError(err);
        });
      },
    });
    this.subscriptions$.push(sub);
  }

  upateUser() {
    const value = {
      ...this.userForm.value,
    };
    this.spinner.show('fullscreen');
    const sub = this.userService.updateUser(value as UserModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Usuario actualizado');
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        processError(error.error).forEach((err) => {
          this.toastService.showError(err);
        });
        this.spinner.hide('fullscreen');
        processError(error.error).forEach((err) => {
          this.toastService.showError(err);
        });
      },
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
    this.imageUrl = 'assets/images/default-placeholder.png';
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
      });
    }
  }

  uploadFile(userId: string, func: (hasError: boolean) => void) {
    if (this.photo) {
      const formData = new FormData();
      formData.append('photo', this.photo);
      const sub = this.userService.uploadPhoto(userId, formData).subscribe({
        next: () => {
          func(false);
        },
        error: () => {
          func(true);
        },
      });
      this.subscriptions$.push(sub);
    } else {
      func(false);
    }
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
            this.setPhoto(user.photo);
          }
        },
        error: (error) => {
          processError(error.error).forEach((err) => {
            this.toastService.showError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }
}
