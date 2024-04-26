import { Injectable } from '@angular/core';

@Injectable()
export class LayoutService {
  toggle: boolean = false;
  handleToggle() {
    console.log('asdf');
    this.toggle = !this.toggle;
  }
}
