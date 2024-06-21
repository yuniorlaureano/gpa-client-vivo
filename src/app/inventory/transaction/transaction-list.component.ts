import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StockModel } from '../models/stock.model';
import { ReasonEnum } from '../../core/models/reason.enum';

@Component({
  selector: 'gpa-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css',
})
export class TransactionListComponent {
  constructor(private router: Router) {}

  handleEdit(stock: StockModel) {
    switch (stock.reasonId) {
      case ReasonEnum.DamagedProduct:
      case ReasonEnum.ExpiredProduct:
      case ReasonEnum.RawMaterial:
        this.router.navigate(['/inventory/output/edit/' + stock.id]);
        break;
      default:
        this.router.navigate(['/inventory/entry/edit/' + stock.id]);
    }
  }

  handleDelete(stock: StockModel) {
    // this.router.navigate(['/stock/sale/edit/' + stock.id]);
  }
}
