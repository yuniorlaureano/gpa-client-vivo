import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '../service/layout.service';
import { ProfileModel } from '../../security/model/profile.model';
import { ProfileService } from '../../security/service/profile.service';
import {
  BehaviorSubject,
  map,
  Observable,
  combineLatest,
  catchError,
  of,
} from 'rxjs';
import { TokenService } from '../service/token.service';
import { AuthService } from '../../security/service/auth.service';
import { ToastService } from '../service/toast.service';
import { TokenClaims } from '../models/token-claims.model';
import { Store } from '@ngxs/store';
import { AddError, RemoveError } from '../ng-xs-store/actions/app.actions';
import { AppState } from '../ng-xs-store/states/app.state';

@Component({
  selector: 'gpa-admin-page-header',
  templateUrl: './admin-page-header.component.html',
  styleUrl: './admin-page-header.component.css',
})
export class AdminPageHeaderComponent implements OnInit, OnDestroy {
  principal: TokenClaims | null = null;
  profiles$!: Observable<ProfileModel[]>;
  updateProfileSubject$ = new BehaviorSubject<string>('');
  errors$ = this.store.select(AppState.getErrors);

  constructor(
    private layoutService: LayoutService,
    private profileService: ProfileService,
    private tokenService: TokenService,
    private authService: AuthService,
    private toastService: ToastService,
    private store: Store
  ) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.subscribeToClaims();
  }

  changeProfile(profileId: string, profileName: string) {
    this.authService.changeProfile(profileId).subscribe({
      next: () => {
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

  removeError(error: string) {
    this.store.dispatch(new RemoveError(error));
  }

  subscribeToClaims() {
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
        }),
        catchError((error) => {
          if (error.status === 403) {
            this.store.dispatch(
              new AddError('No tiene permisos para ver los perfiles')
            );
            this.toastService.showError(error.error.message);
          }
          return of([] as ProfileModel[]);
        })
      );
    }
  }
}
