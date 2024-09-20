import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import {
  AddError,
  MapLoaded,
  SetCurrentMenu,
  SetCurrentSubMenu,
} from './core/ng-xs-store/actions/app.actions';
import { ToastService } from './core/service/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'gpa-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'gpa-client';
  subscriptions$: Subscription[] = [];

  constructor(
    private store: Store,
    private toastService: ToastService,
    private action$: Actions
  ) {
    (window as any)['initMap'] = () => {
      store.dispatch(new MapLoaded());
    };
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
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
  }

  mapLoad() {
    const sub = this.action$
      .pipe(ofActionDispatched(AddError))
      .subscribe((data) => {
        this.toastService.showError(data.payload);
      });
    this.subscriptions$.push(sub);
  }
}
