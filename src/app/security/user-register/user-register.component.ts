import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { UserModel } from '../model/user.model';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { ProfileModel } from '../model/profile.model';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';
import { ProfileService } from '../service/profile.service';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { InvitationTokenModel } from '../model/invitation-token.model';

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
  profilesForInvitation: ResponseModel<ProfileModel> | null = null;
  invitations$: Observable<InvitationTokenModel[]> | null = null;
  invited: boolean = true;
  disabled: boolean = true;

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
    private spinner: NgxSpinnerService,
    private errorService: ErrorService,
    private profileService: ProfileService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadUser();
      this.loadProfilesForInvitation();
    });
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
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
          onPermissionLoad();
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

  loadProfilesForInvitation() {
    if (this.isEdit) {
      const flterModel = new FilterModel();
      flterModel.pageSize = 100;
      const sub = this.profileService.getProfiles(flterModel).subscribe({
        next: (profiles) => {
          this.profilesForInvitation = profiles;
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error cargando perfiles para invitación'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
      this.subscriptions$.push(sub);
    }
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
        processError(error.error || error, 'Error agregando usuario').forEach(
          (err) => {
            this.errorService.addGeneralError(err);
          }
        );
        this.spinner.hide('fullscreen');
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
        processError(
          error.error || error,
          'Error actualizando usuario'
        ).forEach((err) => {
          this.errorService.addGeneralError(err);
        });
        this.spinner.hide('fullscreen');
      },
    });
    this.subscriptions$.push(sub);
  }

  inviteUser(profileId: string) {
    let userId = this.userForm.get('id')?.value;
    if (!userId && !this.isEdit && !this.disabled) {
      return;
    }

    this.spinner.show('fullscreen');
    const sub = this.userService.inviteUser(userId!, profileId).subscribe({
      next: () => {
        this.toastService.showSucess('Invitación enviada');
        this.spinner.hide('fullscreen');
        this.router.navigate(['/auth/users/list']);
      },
      error: (error) => {
        processError(error.error || error, 'Error enviando invitación').forEach(
          (err) => {
            this.errorService.addGeneralError(err);
          }
        );
        this.spinner.hide('fullscreen');
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
        error: (error) => {
          func(true);
          processError(error.error || error, 'Error subiendo foto').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
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
            this.disabled = user.deleted;
            this.invited = user.invited;
            this.profiles = user.profiles;
            this.setPhoto(user.photo);
            this.invitations$ = this.userService.getInvitations(user.id!);
          }
        },
        error: (error) => {
          processError(error.error || error, 'Error cargando usuario').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }
}
