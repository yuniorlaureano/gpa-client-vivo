import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { PermissionService } from '../service/permission.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { ProfileModel } from '../model/profile.model';
import * as profileUtils from '../../core/utils/profile.utils';
import { ProfileService } from '../service/profile.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterProfileModel } from '../model/master-profile.mode';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-profile-permission',
  templateUrl: './profile-permission.component.html',
  styleUrl: './profile-permission.component.css',
})
export class ProfilePermissionComponent
  implements AfterViewInit, OnInit, OnDestroy
{
  profile: ProfileModel | null = null;
  permissions: string[] = [];
  profileUI: any = null;
  @ViewChild('profilecontainer') profilecontainer!: ElementRef;
  masterProfile$!: Observable<MasterProfileModel[]>;

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canEdit: boolean = false;
  canRead: boolean = false;

  constructor(
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private profileService: ProfileService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.masterProfile$ = this.permissionService.getMasterProfile();
    });
  }

  ngAfterViewInit() {
    this.loadPermission();
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Security][
            PermissionConstants.Components.Profile
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
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
    this.canRead = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Read
    );
  }

  getNewProfile() {
    let valueBasedProfile = profileUtils.GetValueBasedProfile(
      this.profilecontainer
    );
    let enwProfile = profileUtils.buildNewProfile(valueBasedProfile);
    return enwProfile;
  }

  onSubmit() {
    let newProfile = this.getNewProfile();
    this.creaUser(newProfile);
  }

  creaUser(newProfile: any[]) {
    let updatedProfile = {
      ...this.profile,
      value: JSON.stringify(newProfile),
    };
    this.spinner.show('fullscreen');
    const sub = this.profileService
      .updateProfile(updatedProfile as ProfileModel)
      .subscribe({
        next: () => {
          this.toastService.showSucess('Perfil actualizado');
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error actualizando perfil').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  loadPermission() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id) {
            return this.permissionService.getPermissionById(id);
          } else {
            return of(null);
          }
        })
      )
      .subscribe({
        next: (profile) => {
          if (profile) {
            this.profile = profile;
            this.setSelectedPermissions(profile.value);
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error cargando permiso').forEach((err) => {
            this.toastService.showError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  setSelectedPermissions(value: string) {
    if (!value) {
      return;
    }

    this.permissions = profileUtils.GetProfileAsPermissions(value);
    profileUtils.setSelectedPermission(this.profilecontainer, this.permissions);
  }
}
