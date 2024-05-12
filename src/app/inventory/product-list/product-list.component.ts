import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductModel } from '../models/product.model';

@Component({
  selector: 'gpa-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent {
  constructor(private router: Router) {}

  handleEdit(product: ProductModel) {
    this.router.navigate(['/inventory/product/' + product.id]);
  }

  handleDelete(product: ProductModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
