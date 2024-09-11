import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../service/category.service';
import { CategoryModel } from '../models/category.model';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, OnDestroy {
  isEdit = false;
  categoryForm = this.formBuilder.group({
    id: [''],
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.required, Validators.maxLength(200)]],
  });

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadCategory();
    });
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Inventory][
            PermissionConstants.Components.Category
          ]
      )
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
          onPermissionLoad();
        },
      });
    this.subscriptions$.push(sub);
  }

  setPermissions(requiredPermissions: RequiredPermissionType) {
    this.canRead = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Read
    );
    this.canCreate = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Create
    );
    this.canDelete = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Delete
    );
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  updateCategory(value: any) {
    this.spinner.show('fullscreen');
    const sub = this.categoryService
      .updateCategory(<CategoryModel>value)
      .subscribe({
        next: () => {
          this.clearForm();
          this.toastService.showSucess('Categoría modificada');
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error modificando categoría').forEach(
            (error) => {
              this.toastService.showError(error);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  createCategory(value: any) {
    value.id = null;
    this.spinner.show('fullscreen');
    const sub = this.categoryService
      .addCategory(<CategoryModel>value)
      .subscribe({
        next: () => {
          this.clearForm();
          this.toastService.showSucess('Categoría creada');
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error creando categoría').forEach(
            (error) => {
              this.toastService.showError(error);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  saveCategory() {
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.valid) {
      const value = {
        ...this.categoryForm.value,
      };
      if (this.isEdit) {
        this.updateCategory(value);
      } else {
        this.createCategory(value);
      }
    }
  }

  loadCategory() {
    const sub = this.route.paramMap
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
          processError(error.error, 'Error cargando categoría').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
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
