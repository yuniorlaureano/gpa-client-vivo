import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryModel } from '../models/category.model';

@Component({
  selector: 'gpa-category-list',
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent {
  constructor(private router: Router) {}

  handleEdit(category: CategoryModel) {
    this.router.navigate(['/inventory/category/' + category.id]);
  }

  handleDelete(category: CategoryModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
