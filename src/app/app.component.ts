import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  SetCurrentMenu,
  SetCurrentSubMenu,
} from './core/ng-xs-store/actions/app.actions';
@Component({
  selector: 'gpa-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'gpa-client';

  constructor(private store: Store) {}

  ngOnInit(): void {
    const menu = sessionStorage.getItem('menu');
    if (menu) {
      this.store.dispatch(new SetCurrentMenu(menu));
    }
    const subMenu = sessionStorage.getItem('subMenu');
    if (subMenu) {
      this.store.dispatch(new SetCurrentSubMenu(subMenu));
    }
  }
}
