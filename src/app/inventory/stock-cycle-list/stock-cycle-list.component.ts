import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StockCycleModel } from '../models/stock-cycle.model';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import { Subscription } from 'rxjs';
import { StockCycleService } from '../service/cycle.service';
import { ErrorService } from '../../core/service/error.service';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-stock-list',
  templateUrl: './stock-cycle-list.component.html',
  styleUrl: './stock-cycle-list.component.css',
})
export class StockCycleListComponent implements OnDestroy {
  reloadTable: number = 1;
  subscriptions$: Subscription[] = [];

  constructor(
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private stockCycleService: StockCycleService,
    private errorService: ErrorService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleEdit(cycle: StockCycleModel) {
    this.router.navigate(['inventory/stock/cycle/' + cycle.id + '/detail']);
  }

  handleDelete(cycle: StockCycleModel) {
    this.confirmService
      .confirm(
        'Ciclo de inventario',
        'Está seguro de eliminar el ciclo de inventario:\n ' + cycle.note
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.stockCycleService
          .removeStockCycle(cycle.id!)
          .subscribe({
            next: () => {
              this.toastService.showSucess('Ciclo de inventario eliminado');
              this.reloadTable = this.reloadTable * -1;
              this.spinner.hide('fullscreen');
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              processError(
                error.error || error,
                'Error elimiando ciclo de inventario'
              ).forEach((x) => this.errorService.addGeneralError(x));
            },
          });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
