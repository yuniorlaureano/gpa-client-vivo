import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  MapLoaded,
  SetCurrentMenu,
  SetCurrentSubMenu,
} from './core/ng-xs-store/actions/app.actions';
import { AppState } from './core/ng-xs-store/states/app.state';
import { ToastService } from './core/service/toast.service';
@Component({
  selector: 'gpa-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'gpa-client';
  mapLoaded$ = this.store.select(AppState.getErrors);

  constructor(private store: Store, private toastService: ToastService) {
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

    this.mapLoaded$.subscribe((errors) => {
      if (errors.length) {
        errors.forEach((error) => {
          this.toastService.showError(error);
        });
      }
    });
  }
}
