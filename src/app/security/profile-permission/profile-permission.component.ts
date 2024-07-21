import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { PermissionService } from '../service/permission.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { ProfileModel } from '../model/profile.model';
import * as profileUtils from '../../core/utils/profile.utils';
import { ProfileService } from '../service/profile.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterProfileModel } from '../model/master-profile.mode';

@Component({
  selector: 'gpa-profile-permission',
  templateUrl: './profile-permission.component.html',
  styleUrl: './profile-permission.component.css',
})
export class ProfilePermissionComponent implements AfterViewInit, OnInit {
  profile: ProfileModel | null = null;
  permissions: string[] = [];
  profileUI: any = null;
  @ViewChild('profilecontainer') profilecontainer!: ElementRef;
  masterProfile$!: Observable<MasterProfileModel[]>;

  constructor(
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private profileService: ProfileService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.masterProfile$ = this.permissionService.getMasterProfile();
  }

  ngAfterViewInit() {
    this.loadPermission();
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
    this.profileService
      .updateProfile(updatedProfile as ProfileModel)
      .subscribe({
        next: () => {
          this.toastService.showSucess('Perfil actualizado');
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al actualizar perfil. ');
        },
      });
  }

  loadPermission() {
    this.route.paramMap
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
          this.toastService.showError('Error al cargar perfil. ');
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
