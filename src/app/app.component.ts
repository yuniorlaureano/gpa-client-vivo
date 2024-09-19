import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  LoadReasons,
  MapLoaded,
  SetCurrentMenu,
  SetCurrentSubMenu,
} from './core/ng-xs-store/actions/app.actions';
import { AppState } from './core/ng-xs-store/states/app.state';
import { ToastService } from './core/service/toast.service';
import { FilterModel } from './core/models/filter.model';
import { ReasonService } from './inventory/service/reason.service';
import { Subscription } from 'rxjs';
import { processError } from './core/utils/error.utils';
import { ErrorService } from './core/service/error.service';
@Component({
  selector: 'gpa-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'gpa-client';
  mapLoaded$ = this.store.select(AppState.getErrors);
  subscriptions$: Subscription[] = [];

  constructor(
    private store: Store,
    private toastService: ToastService,
    private reasonService: ReasonService,
    private errorService: ErrorService
  ) {
    (window as any)['initMap'] = () => {
      store.dispatch(new MapLoaded());
    };
  }

  ngOnInit(): void {
    const menu = sessionStorage.getItem('menu');
    if (menu) {
      this.store.dispatch(new SetCurrentMenu(menu));
    }
    const subMenu = sessionStorage.getItem('subMenu');
    if (subMenu) {
      this.store.dispatch(new SetCurrentSubMenu(subMenu));
    }

    this.mapLoad();
    this.loadReasons();
  }

  mapLoad() {
    const sub = this.mapLoaded$.subscribe((errors) => {
      if (errors.length) {
        errors.forEach((error) => {
          this.toastService.showError(error);
        });
      }
    });
    this.subscriptions$.push(sub);
  }

  loadReasons() {
    const filter = new FilterModel();
    filter.pageSize = 100;
    const sub = this.reasonService.getReasons(filter).subscribe({
      next: (reasons) => {
        this.store.dispatch(new LoadReasons(reasons.data));
      },
      error: (error) => {
        processError(error.error || error, 'Error cargando motivos').forEach(
          (err) => {
            this.errorService.addGeneralError(err);
          }
        );
      },
    });
    this.subscriptions$.push(sub);
  }
}
