import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReceivableAccountModel } from '../model/receivable-account.model';

@Component({
  selector: 'gpa-receivable-account-list',
  templateUrl: './receivable-account-list.component.html',
  styleUrl: './receivable-account-list.component.css',
})
export class ReceivableAccountListComponent {
  constructor(private router: Router) {}

  handleEdit(invoice: ReceivableAccountModel) {
    this.router.navigate([
      '/invoice/receivable-account/invoice/' + invoice.invoiceId,
    ]);
  }

  handleDelete(invoice: ReceivableAccountModel) {
    this.router.navigate([
      '/invoice/receivable-account/invoice/' + invoice.invoiceId,
    ]);
  }
}
