import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ExistenceModel } from '../models/existence.model';

@Component({
  selector: 'gpa-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css',
})
export class StockListComponent {
  constructor(private router: Router) {}

  handleEdit(invoice: ExistenceModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }

  handleDelete(invoice: ExistenceModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
