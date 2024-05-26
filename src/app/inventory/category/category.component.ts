import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../service/category.service';
import { CategoryModel } from '../models/category.model';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';

@Component({
  selector: 'gpa-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  isEdit = false;
  categoryForm = this.formBuilder.group({
    id: [''],
    name: ['', Validators.required],
    description: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategory();
  }

  saveCategory() {
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.valid) {
      const value = {
        ...this.categoryForm.value,
      };
      if (this.isEdit) {
        this.categoryService.updateCategory(<CategoryModel>value).subscribe({
          next: () => {
            this.clearForm();
            this.toastService.showSucess('Categoría modificada');
          },
          error: (err) =>
            this.toastService.showSucess('Error modificando categoría. ' + err),
        });
      } else {
        value.id = null;
        this.categoryService.addCategory(<CategoryModel>value).subscribe({
          next: () => {
            this.clearForm();
            this.toastService.showSucess('Categoría creada');
          },
          error: (err) =>
            this.toastService.showSucess('Error creando categoría. ' + err),
        });
      }
    }
  }

  loadCategory() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.categoryService.getCategoryById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (category) => {
          if (category) {
            this.categoryForm.setValue({
              id: category.id,
              name: category.name,
              description: category.description,
            });
          }
        },
      });
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/inventory/category']);
  }

  clearForm() {
    this.categoryForm.reset();
    this.isEdit = false;
  }
}
