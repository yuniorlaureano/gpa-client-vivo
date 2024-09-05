import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { LayoutService } from '../service/layout.service';
import {
  SetCurrentMenu,
  SetCurrentSubMenu,
} from '../ng-xs-store/actions/app.actions';

@Component({
  selector: 'gpa-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  menu: string = '';
  subscription$: Subscription | null = null;

  constructor(private store: Store, private layoutService: LayoutService) {
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

  ngOnInit(): void {}

  handleMenuSelected(menu: string) {
    if (menu === this.menu) {
      this.store.dispatch(new SetCurrentMenu(menu));
      sessionStorage.setItem('menu', '');
    } else {
      this.store.dispatch(new SetCurrentMenu(menu));
      sessionStorage.setItem('menu', menu);
    }
  }

  handleSubMenuSelected(menu: string) {
    this.layoutService.closeToggle();
    this.store.dispatch(new SetCurrentSubMenu(menu));
    sessionStorage.setItem('subMenu', menu);
  }

  handleDasboardSelected() {
    this.handleMenuSelected('dashboard');
    this.handleSubMenuSelected('Dashboard');
  }
}
