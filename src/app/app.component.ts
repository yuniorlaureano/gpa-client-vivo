import { Component, OnDestroy, OnInit } from '@angular/core';
import { PermissionService } from './security/service/permission.service';
import { Store } from '@ngxs/store';
import { AddRequiredPermissions } from './core/ng-xs-store/actions/app.actions';
import { ToastService } from './core/service/toast.service';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { AppState } from './core/ng-xs-store/states/app.state';
@Component({
  selector: 'gpa-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'gpa-client';
  permissionSubscription$!: Subscription;
  profileSubscription$!: Subscription;
  fetchPermissionsSubject$ = new BehaviorSubject<boolean>(true);

  constructor(
    private permissionService: PermissionService,
    private store: Store,
    private toastService: ToastService
  ) {}

  ngOnDestroy(): void {
    this.permissionSubscription$?.unsubscribe();
    this.profileSubscription$?.unsubscribe();
  }

  ngOnInit(): void {
    this.handleFetchedProfiles();
    this.fetchPermissions();
  }

  handleFetchedProfiles() {
    this.profileSubscription$ = this.store
      .select(AppState.getProfiles)
      .subscribe({
        next: (profiles) => {
          if (profiles.length) {
            this.fetchPermissionsSubject$.next(true);
          }
        },
      });
  }

  fetchPermissions() {
    this.permissionSubscription$ = this.fetchPermissionsSubject$
      .pipe(switchMap((_) => this.permissionService.getInlinePermissions()))
      .subscribe({
        next: (data) => {
          this.store.dispatch(new AddRequiredPermissions(data));
        },
        error: (error) => {
          this.toastService.showError('Error cargando permisos');
        },
      });
  }
}
