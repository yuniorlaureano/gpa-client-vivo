import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import { Subscription } from 'rxjs';
import { processError } from '../../core/utils/error.utils';
import { UnitModel } from '../model/unit.model';
import { UnitService } from '../service/unit.service';

@Component({
  selector: 'gpa-unit-list',
  templateUrl: './unit-list.component.html',
})
export class UnitListComponent {
  reloadTable = 1;
  subscriptions$: Subscription[] = [];

  constructor(
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private unitService: UnitService
  ) {}

  handleEdit(unit: UnitModel) {
    this.router.navigate(['/general/unit/' + unit.id]);
  }

  handleDelete(unit: UnitModel) {
    this.confirmService
      .confirm('Unit', 'Está seguro de eliminar la unit:\n ' + unit.name)
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.unitService.removeUnit(unit.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Unidad eliminada');
            this.reloadTable = this.reloadTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            processError(error, 'Error eliminando unidad').forEach((x) =>
              this.toastService.showError(x)
            );
          },
        });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
