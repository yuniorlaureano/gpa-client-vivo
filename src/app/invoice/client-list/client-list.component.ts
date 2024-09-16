import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClientModel } from '../model/client.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import { ClientService } from '../service/client.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { Subscription } from 'rxjs';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';

@Component({
  selector: 'gpa-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent {
  reloadTable: number = 1;
  subscriptions$: Subscription[] = [];

  constructor(
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private clientService: ClientService,
    private errorService: ErrorService
  ) {}

  handleEdit(client: ClientModel) {
    this.router.navigate(['/invoice/client/edit/' + client.id]);
  }

  handleDelete(client: ClientModel) {
    this.confirmService
      .confirm(
        'Cliente',
        'Está seguro de eliminar el cliente:\n ' +
          client.name +
          ' ' +
          client.lastName
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.clientService.removeClient(client.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Cliente eliminado');
            this.reloadTable = this.reloadTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            processError(
              error.error || error,
              'Error eliminando cliente'
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
