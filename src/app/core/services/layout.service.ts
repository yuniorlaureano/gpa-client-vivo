import { Injectable } from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';

@Injectable()
export class LayoutService {
  toggle: boolean = false;
  selectedMenu: string = '';

  constructor(private router: Router) {
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        console.log(router);
      }
    });
  }

  handleToggle() {
    this.toggle = !this.toggle;
  }

  setSelectedMenu(menu: string) {
    this.selectedMenu = menu;
  }
}
