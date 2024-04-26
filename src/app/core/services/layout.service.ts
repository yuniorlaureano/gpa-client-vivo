import { Injectable } from '@angular/core';

@Injectable()
export class LayoutService {
  menus: any = {
    inventory: 'Inventario',
    invoice: 'Facturación',
    report: 'Reportes',
    configuration: 'Configuración',
    security: 'Seguridad',
  };
  toggle: boolean = false;
  selectedMenu: string = '';

  handleToggle() {
    this.toggle = !this.toggle;
  }

  setSelectedMenu(menu: string) {
    this.selectedMenu = menu;
  }

  getMenuHeader() {
    return this.menus[this.selectedMenu];
  }
}
