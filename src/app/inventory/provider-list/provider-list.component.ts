import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { Subscription } from 'rxjs';
import { processError } from '../../core/utils/error.utils';
import { ProviderService } from '../service/provider.service';
import { ProviderModel } from '../models/provider.model';
import { ErrorService } from '../../core/service/error.service';

@Component({
  selector: 'gpa-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrl: './provider-list.component.css',
})
export class ProviderListComponent {
  reloadTable: number = 1;
  subscriptions$: Subscription[] = [];

  constructor(
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private providerService: ProviderService,
    private errorService: ErrorService
  ) {}

  handleEdit(provider: ProviderModel) {
    this.router.navigate(['/inventory/provider/edit/' + provider.id]);
  }

  handleDelete(provider: ProviderModel) {
    this.confirmService
      .confirm(
        'Proveedor',
        'Está seguro de eliminar el proveedor:\n ' +
          provider.name +
          ' ' +
          provider.lastName
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.providerService
          .removeProvider(provider.id!)
          .subscribe({
            next: () => {
              this.toastService.showSucess('Proveedor eliminado');
              this.reloadTable = this.reloadTable * -1;
              this.spinner.hide('fullscreen');
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              processError(
                error.error || error,
                'Error eliminando proveedor'
              ).forEach((err) => {
                this.errorService.addGeneralError(err);
              });
            },
          });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
