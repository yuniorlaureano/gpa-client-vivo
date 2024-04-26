import { Component } from '@angular/core';

@Component({
  selector: 'gpa-manufactured-product-entry',
  templateUrl: './manufactured-product-entry.component.html',
  styleUrl: './manufactured-product-entry.component.css',
})
export class ManufacturedProductEntryComponent {
  isProductCatalogVisible: boolean = false;

  handleShowProductCatalog(visible: boolean) {
    this.isProductCatalogVisible = visible;
  }
}
