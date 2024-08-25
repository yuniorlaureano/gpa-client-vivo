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

  handleEdit(existence: ExistenceModel) {
    this.router.navigate(['/inventory/product/' + existence.productId]);
  }

  handleDelete(existence: ExistenceModel) {}
}
