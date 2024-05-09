import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StockModel } from '../models/stock.model';

@Component({
  selector: 'gpa-stock-master-list',
  templateUrl: './stock-master-list.component.html',
  styleUrl: './stock-master-list.component.css',
})
export class StockMasterListComponent {
  constructor(private router: Router) {}

  handleEdit(stock: StockModel) {
    this.router.navigate([
      '/inventory/manufactured-product-entry/edit/' + stock.id,
    ]);
  }

  handleDelete(stock: StockModel) {
    // this.router.navigate(['/stock/sale/edit/' + stock.id]);
  }
}
