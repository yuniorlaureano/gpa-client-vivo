import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AddonModel } from '../models/addon.model';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import { AddonService } from '../service/addon.service';
import { Subscription } from 'rxjs';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-addon-list',
  templateUrl: './addon-list.component.html',
})
export class AddonListComponent {
  reloadTable = 1;
  subscriptions$: Subscription[] = [];

  constructor(
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private addonService: AddonService
  ) {}

  handleEdit(addon: AddonModel) {
    this.router.navigate(['/inventory/addon/edit/' + addon.id]);
  }

  handleDelete(addon: AddonModel) {
    this.confirmService
      .confirm(
        'Agregado',
        'Está seguro de eliminar el agregado:\n ' + addon.concept
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.addonService.removeAddon(addon.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Agregado eliminado');
            this.reloadTable = this.reloadTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            processError(error.error, 'Error eliminado agregado').forEach(
              (err) => {
                this.toastService.showError(err);
              }
            );
          },
        });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
