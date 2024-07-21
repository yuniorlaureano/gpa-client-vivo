import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../service/category.service';
import { CategoryModel } from '../models/category.model';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';

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
    private router: Router,
    private spinner: NgxSpinnerService
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
        this.spinner.show('fullscreen');
        this.categoryService.updateCategory(<CategoryModel>value).subscribe({
          next: () => {
            this.clearForm();
            this.toastService.showSucess('Categoría modificada');
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            this.toastService.showError('Error al modificar la categoría');
          },
        });
      } else {
        value.id = null;
        this.spinner.show('fullscreen');
        this.categoryService.addCategory(<CategoryModel>value).subscribe({
          next: () => {
            this.clearForm();
            this.toastService.showSucess('Categoría creada');
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            this.toastService.showError('Error al crear la categoría');
          },
        });
      }
    }
  }

  loadCategory() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
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
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al cargar la categoría');
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
