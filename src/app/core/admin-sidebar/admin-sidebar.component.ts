import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { SetCurrentMenu } from '../ng-xs-store/actions/app.actions';

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
    console.log('AdminSidebarMenuItemComponent ngOnInit');
    this.subscription$ = this.store
      .select((state: any) => state.app.menu)
      .subscribe({
        next: (menu) => {
          console.log('AdminSidebarMenuItemComponent menu', menu);
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
  }
}
