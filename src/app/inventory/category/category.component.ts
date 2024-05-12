import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../service/category.service';
import { CategoryModel } from '../models/category.model';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';

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
    private route: ActivatedRoute
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
          },
        });
      } else {
        value.id = null;
        this.categoryService.addCategory(<CategoryModel>value).subscribe({
          next: () => {
            this.clearForm();
          },
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
  }

  clearForm() {
    this.categoryForm.reset();
    this.isEdit = false;
  }
}
