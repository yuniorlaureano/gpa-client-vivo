import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import {
  SetCurrentMenu,
  SetCurrentSubMenu,
} from '../ng-xs-store/actions/app.actions';

declare let jQuery: any;

@Component({
  selector: 'gpa-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  menu: string = '';
  subscription$: Subscription | null = null;

  constructor(private store: Store) {
    this.subscription$ = this.store
      .select((state: any) => state.app.menu)
      .subscribe({
        next: (menu) => {
          this.menu = menu;
        },
      });
  }
  ngOnDestroy(): void {
    this.subscription$?.unsubscribe();
  }

  ngOnInit(): void {
    jQuery('.sidebarMenuScroll').overlayScrollbars({
      scrollbars: {
        visibility: 'auto',
        autoHide: 'scroll',
        autoHideDelay: 200,
        dragScrolling: true,
        clickScrolling: false,
        touchSupport: true,
        snapHandle: false,
      },
    });
  }

  handleMenuSelected(menu: string) {
    this.store.dispatch(new SetCurrentMenu(menu));
    sessionStorage.setItem('menu', menu);
  }

  handleSubMenuSelected(menu: string) {
    this.store.dispatch(new SetCurrentSubMenu(menu));
    sessionStorage.setItem('subMenu', menu);
  }
}
