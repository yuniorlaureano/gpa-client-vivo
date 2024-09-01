import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryModel } from '../models/category.model';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import { CategoryService } from '../service/category.service';
import { Subscription } from 'rxjs';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-category-list',
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent {
  reloadTable = 1;
  subscriptions$: Subscription[] = [];

  constructor(
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private categoryService: CategoryService
  ) {}

  handleEdit(category: CategoryModel) {
    this.router.navigate(['/inventory/category/' + category.id]);
  }

  handleDelete(category: CategoryModel) {
    this.confirmService
      .confirm(
        'Categoría',
        'Está seguro de eliminar la categoría:\n ' + category.name
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.categoryService
          .removeCategory(category.id!)
          .subscribe({
            next: () => {
              this.toastService.showSucess('Categoría eliminada');
              this.reloadTable = this.reloadTable * -1;
              this.spinner.hide('fullscreen');
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              processError(error, 'Error eliminando categoría').forEach((x) =>
                this.toastService.showError(x)
              );
            },
          });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
