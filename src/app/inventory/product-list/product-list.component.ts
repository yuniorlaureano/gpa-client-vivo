import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductModel } from '../models/product.model';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import { ProductService } from '../service/product.service';
import { Subscription } from 'rxjs';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnDestroy {
  reloadTable: number = 1;
  constructor(
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private productService: ProductService
  ) {}

  subscriptions$: Subscription[] = [];

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleEdit(product: ProductModel) {
    this.router.navigate(['/inventory/product/' + product.id]);
  }

  handleDelete(product: ProductModel) {
    this.confirmService
      .confirm(
        'Producto',
        'Está seguro de eliminar el producto:\n ' + product.name
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.productService.deleteProduct(product.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Producto eliminado');
            this.reloadTable = this.reloadTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            processError(
              error.error || error,
              'Error eliminando producto'
            ).forEach((err) => {
              this.toastService.showError(err);
            });
          },
        });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
