import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProfileModel } from '../../security/model/profile.model';
import { ProfileService } from '../../security/service/profile.service';
import {
  BehaviorSubject,
  map,
  Observable,
  combineLatest,
  catchError,
  of,
  tap,
  Subscription,
} from 'rxjs';
import { TokenService } from '../service/token.service';
import { AuthService } from '../../security/service/auth.service';
import { ToastService } from '../service/toast.service';
import { TokenClaims } from '../models/token-claims.model';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import {
  AddRequiredPermissions,
  CleanError,
  RefreshCredentials,
  RemoveError,
  SetProfiles,
} from '../ng-xs-store/actions/app.actions';
import { AppState } from '../ng-xs-store/states/app.state';
import { NgxSpinnerService } from 'ngx-spinner';

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
  submenu = '';
  subscriptions$: Subscription[] = [];
  profileImage = 'assets/images/default-placeholder.png';

  constructor(
    private profileService: ProfileService,
    private tokenService: TokenService,
    private authService: AuthService,
    private toastService: ToastService,
    private store: Store,
    private spinner: NgxSpinnerService,
    private action$: Actions
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    const subMenu = sessionStorage.getItem('subMenu');
    if (subMenu) {
      this.submenu = subMenu;
    }
    this.loadAndSubscribeToCliamChange();
    this.handleSubmenu();
  }

  loadAndSubscribeToCliamChange() {
    const sub = this.action$
      .pipe(ofActionDispatched(RefreshCredentials))
      .subscribe(() => this.subscribeToClaims());
    this.subscribeToClaims();
    this.subscriptions$.push(sub);
  }

  handleSubmenu() {
    const sub = this.store
      .select((state: any) => state.app.submenu)
      .subscribe({
        next: (submenu) => {
          this.submenu = submenu;
        },
      });

    this.subscriptions$.push(sub);
  }

  changeProfile(profileId: string, profileName: string) {
    this.spinner.show('fullscreen');
    this.store.dispatch(new CleanError());
    const sub = this.authService.changeProfile(profileId).subscribe({
      next: () => {
        this.updateProfileSubject$.next(profileId);
        this.toastService.showSucess(`Ha elegido el perifl de ${profileName}`);
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.toastService.showError(`Error al cambiar de perfil`);
        this.spinner.hide('fullscreen');
      },
    });
    this.subscriptions$.push(sub);
  }

  logOut() {
    this.authService.logOut();
  }

  removeError(error: string) {
    this.store.dispatch(new RemoveError(error));
  }

  subscribeToClaims() {
    let claims = this.tokenService.getClaims();
    if (claims) {
      this.principal = claims;
      this.profileImage =
        claims.photo || 'assets/images/default-placeholder.png';
      this.profiles$ = this.loadProfiles(claims);
    }
  }

  loadProfiles(claims: TokenClaims) {
    return combineLatest([
      this.profileService.getProfilesByUserId(claims.userId),
      this.updateProfileSubject$,
    ]).pipe(
      map(([profiles, u]) => {
        return profiles.map((p) => {
          return {
            ...p,
            isCurrent: p.id === (u || claims.profileId),
          };
        });
      }),
      tap((profiles) => {
        this.store.dispatch(new SetProfiles(profiles));
        let permissions = this.tokenService.getPermissions();
        if (permissions) {
          this.store.dispatch(new AddRequiredPermissions(permissions));
        }
      }),
      catchError((error) => {
        this.toastService.showError(`Error cargando permisos`);
        return of([] as ProfileModel[]);
      })
    );
  }
}
