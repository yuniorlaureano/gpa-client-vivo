import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import { Subscription } from 'rxjs';
import { PrintInformationService } from '../service/print-information.service';
import { PrintInformationModel } from '../model/print-information.model';

@Component({
  selector: 'gpa-print-information-list',
  templateUrl: './print-information-list.component.html',
})
export class PrintInformationListComponent implements OnDestroy {
  reloadTable: number = 1;
  constructor(
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private printInformationService: PrintInformationService
  ) {}

  subscriptions$: Subscription[] = [];

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleEdit(printInformation: PrintInformationModel) {
    this.router.navigate([
      '/inventory/print-information/edit/' + printInformation.id,
    ]);
  }

  handleDelete(printInformation: PrintInformationModel) {
    this.confirmService
      .confirm(
        'Información de impresión',
        'Está seguro de eliminar la información de impresión:\n ' +
          printInformation.companyName
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.printInformationService
          .deletePrintInformation(printInformation.id!)
          .subscribe({
            next: () => {
              this.toastService.showSucess(
                'Información de impresión eliminada'
              );
              this.reloadTable = this.reloadTable * -1;
              this.spinner.hide('fullscreen');
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              this.toastService.showError(
                'Error elimiando información de impresión'
              );
            },
          });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
