import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ExistenceModel } from '../models/existence.model';

@Component({
  selector: 'gpa-existence-list',
  templateUrl: './existence-list.component.html',
  styleUrl: './existence-list.component.css',
})
export class ExistenceListComponent {
  constructor(private router: Router) {}

  handleEdit(invoice: ExistenceModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }

  handleDelete(invoice: ExistenceModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
