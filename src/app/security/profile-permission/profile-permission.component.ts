import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { PermissionService } from '../service/permission.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { ProfileModel } from '../model/profile.model';
import * as profileUtils from '../../core/utils/profile.utils';
import { ProfileService } from '../service/profile.service';

@Component({
  selector: 'gpa-profile-permission',
  templateUrl: './profile-permission.component.html',
  styleUrl: './profile-permission.component.css',
})
export class ProfilePermissionComponent implements AfterViewInit {
  profile: ProfileModel | null = null;
  permissions: string[] = [];
  profileUI: any = null;
  @ViewChild('profilecontainer') profilecontainer!: ElementRef;

  masterProfile = [
    {
      app: 'GPA',
      modules: [
        {
          id: 'inventory',
          components: [
            {
              id: 'addon',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'category',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'productLocation',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'product',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'provider',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'reason',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'stockCycle',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'stock',
              permissions: ['create', 'update', 'delete', 'read'],
            },
          ],
        },
        {
          id: 'invoice',
          components: [
            {
              id: 'client',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'invoice',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            {
              id: 'receivableAccount',
              permissions: ['create', 'update', 'delete', 'read'],
            },
          ],
        },
        {
          id: 'report',
          components: [],
        },
        {
          id: 'security',
          components: [],
        },
        {
          id: 'common',
          components: [],
        },
      ],
    },
  ];

  constructor(
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private profileService: ProfileService
  ) {}

  ngAfterViewInit() {
    this.loadUser();
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

    this.profileService
      .updateProfile(updatedProfile as ProfileModel)
      .subscribe({
        next: () => {
          this.toastService.showSucess('Perfil actualizado');
        },
        error: (err) =>
          this.toastService.showError('Error actualizando perfil. ' + err),
      });
  }

  loadUser() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
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
        },
      });
  }

  setSelectedPermissions(value: string) {
    if (!value) {
      return;
    }

    this.permissions = profileUtils.GetProfileAsPermissions(value);
    profileUtils.setSelectedPermission(this.profilecontainer, this.permissions);
  }
}
