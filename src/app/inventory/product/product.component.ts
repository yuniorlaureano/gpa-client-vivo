import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ProductService } from '../service/product.service';
import { ProductModel } from '../models/product.model';

@Component({
  selector: 'gpa-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  isEdit = false;

  productForm = this.formBuilder.group({
    id: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.loadProduct();
  }

  saveProduct() {
    this.productForm.markAllAsTouched();
    if (this.productForm.valid) {
      const value = {
        ...this.productForm.value,
      };
      if (this.isEdit) {
        this.productService.updateProduct(<ProductModel>value).subscribe({
          next: () => {
            this.clearForm();
          },
        });
      } else {
        value.id = null;
        this.productService.updateProduct(<ProductModel>value).subscribe({
          next: () => {
            this.clearForm();
          },
        });
      }
    }
  }

  loadProduct() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.productService.getProductById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (product) => {
          if (product) {
          }
        },
      });
  }

  handleCancel() {
    this.clearForm();
  }

  clearForm() {
    this.isEdit = false;
  }
}
