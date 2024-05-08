import { Component } from '@angular/core';
import { InvoiceModel } from '../model/invoice.model';
import { Router } from '@angular/router';

@Component({
  selector: 'gpa-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrl: './sale-list.component.css',
})
export class SaleListComponent {
  constructor(private router: Router) {}

  handleEdit(invoice: InvoiceModel) {
    this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }

  handleDelete(invoice: InvoiceModel) {
    this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
