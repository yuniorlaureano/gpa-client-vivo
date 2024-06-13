import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RawProductCatalogModel } from '../models/raw-product-catalog.model';
import { StockCycleModel } from '../models/stock-cycle.model';

@Component({
  selector: 'gpa-stock-list',
  templateUrl: './stock-cycle-list.component.html',
  styleUrl: './stock-cycle-list.component.css',
})
export class StockCycleListComponent {
  constructor(private router: Router) {}

  handleEdit(cycle: StockCycleModel) {
    this.router.navigate(['inventory/stock/cycle/' + cycle.id + '/detail']);
  }

  handleDelete(cycle: StockCycleModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
