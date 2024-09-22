import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterModel } from '../../core/models/filter.model';
import { NgxSpinnerService } from 'ngx-spinner';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import * as ProfileUtils from '../../core/utils/profile.utils';
import { PrintInformationService } from '../service/print-information.service';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';
import { ReportTemplateModel } from '../model/report-template.model';

@Component({
  selector: 'gpa-report-template-list-table',
  templateUrl: './report-template-list-table.component.html',
})
export class ReporteTemplateListTableComponent {
  @Output() onEdit = new EventEmitter<ReportTemplateModel>();

  public data: ReportTemplateModel[] = [];
  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canEdit: boolean = false;

  constructor(
    private printInformationService: PrintInformationService,
    private spinner: NgxSpinnerService,
    private errorService: ErrorService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadReportTemplate();
    });
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.General][
            PermissionConstants.Components.PrintInformation
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
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  loadReportTemplate() {
    this.spinner.show('table-spinner');
    let searchModel = new FilterModel();
    const sub = this.printInformationService
      .getReportTemplates(searchModel)
      .subscribe({
        next: (data) => {
          this.data = data;
          this.spinner.hide('table-spinner');
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error cargando templates de reportes'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
          this.spinner.hide('table-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }

  handleEdit(model: ReportTemplateModel) {
    this.onEdit.emit(model);
  }

  getTemplateDescription(code: string) {
    switch (code) {
      case 'TRANSACTION_TEMPLATE':
        return 'Plantilla de transacción';
      case 'STOCK_CYCLE_DETAILS_TEMPLATE':
        return 'Plantilla de detalles de ciclo de inventario';
      case 'SALE_TEMPLATE':
        return 'Plantilla de venta';
      case 'INVOICE_TEMPLATE':
        return 'Plantilla de factura';
      case 'PROOF_OF_PAYMENT_TEMPLATE':
        return 'Plantilla de comprobante de pago';
      case 'RECEIVABLE_PROOF_OF_PAYMENT_TEMPLATE':
        return 'Plantilla de comprobante de pago de cuentas por cobrar';
      case 'EXISTENCE_TEMPLATE':
        return 'Plantilla de existencia';
      case 'USER_INVITATION_TEMPLATE':
        return 'Plantilla de invitación de usuario';
      case 'PASSWORD_RESET_TEMPLATE':
        return 'Plantilla de restablecimiento de contraseña';
      case 'USER_INVITATION_REDEMPTION_TEMPLATE':
        return 'Plantilla de redención de invitación de usuario';
      default:
        return 'Desconocido';
    }
  }
}
