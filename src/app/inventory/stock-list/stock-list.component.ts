import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RawProductCatalogModel } from '../models/raw-product-catalog.model';

@Component({
  selector: 'gpa-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css',
})
export class StockListComponent {
  constructor(private router: Router) {}

  handleEdit(invoice: RawProductCatalogModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }

  handleDelete(invoice: RawProductCatalogModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
