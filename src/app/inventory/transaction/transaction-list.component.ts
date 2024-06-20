import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StockModel } from '../models/stock.model';

@Component({
  selector: 'gpa-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css',
})
export class TransactionListComponent {
  constructor(private router: Router) {}

  handleEdit(stock: StockModel) {
    this.router.navigate(['/inventory/transaction/edit/' + stock.id]);
  }

  handleDelete(stock: StockModel) {
    // this.router.navigate(['/stock/sale/edit/' + stock.id]);
  }
}
