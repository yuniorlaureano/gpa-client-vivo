import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../service/layout.service';
import { ProfileModel } from '../../security/model/profile.model';
import { ProfileService } from '../../security/service/profile.service';
import { BehaviorSubject, map, Observable, combineLatest } from 'rxjs';
import { TokenService } from '../service/token.service';
import { AuthService } from '../../security/service/auth.service';
import { ToastService } from '../service/toast.service';
import { TokenClaims } from '../models/token-claims.model';

@Component({
  selector: 'gpa-admin-page-header',
  templateUrl: './admin-page-header.component.html',
  styleUrl: './admin-page-header.component.css',
})
export class AdminPageHeaderComponent implements OnInit {
  principal: TokenClaims | null = null;
  profiles$!: Observable<ProfileModel[]>;
  updateProfileSubject$ = new BehaviorSubject<string>('');

  constructor(
    private layoutService: LayoutService,
    private profileService: ProfileService,
    private tokenService: TokenService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    let claims = this.tokenService.getClaims();
    if (claims) {
      this.principal = claims;
      this.profiles$ = combineLatest([
        this.profileService.getProfilesByUserId(claims.userId),
        this.updateProfileSubject$,
      ]).pipe(
        map(([profiles, u]) => {
          for (let profile of profiles) {
            profile.isCurrent = profile.id === (u || claims.profileId);
          }
          return profiles;
        })
      );
    }
  }

  changeProfile(profileId: string, profileName: string) {
    this.authService.changeProfile(profileId).subscribe({
      next: (token) => {
        this.updateProfileSubject$.next(profileId);
        this.toastService.showSucess(`Ha elegido el perifl de ${profileName}`);
      },
      error: (error) => {
        this.toastService.showSucess(`Error al cambiar de perfil`);
        this.toastService.showSucess(error);
      },
    });
  }

  logOut() {
    this.authService.logOut();
  }

  getCurrentMenu() {
    return this.layoutService.getMenuHeader();
  }
}
