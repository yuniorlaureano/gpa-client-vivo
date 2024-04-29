import { Component } from '@angular/core';

@Component({
  selector: 'gpa-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css',
})
export class SaleComponent {
  isProductCatalogVisible: boolean = false;
  isClientCatalogVisible: boolean = false;

  handleShowProductCatalog(visible: boolean) {
    this.isProductCatalogVisible = visible;
  }

  handleShowClientCatalog(visible: boolean) {
    this.isClientCatalogVisible = visible;
  }
}
