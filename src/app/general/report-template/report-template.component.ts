import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { PrintInformationService } from '../service/print-information.service';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';
import { ReportTemplateModel } from '../model/report-template.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'gpa-report-template',
  templateUrl: './report-template.component.html',
  styleUrl: './report-template.component.css',
})
export class ReporteTemplateComponent implements OnInit, OnDestroy {
  isEdit: boolean = false;
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canEdit: boolean = false;

  //form
  reportTemplateForm = this.fb.group({
    id: [''],
    code: ['', [Validators.required]],
    template: ['', [Validators.required]],
    width: [null],
    height: [null],
  });

  constructor(
    private fb: FormBuilder,
    private printInformationService: PrintInformationService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private spinner: NgxSpinnerService,
    private store: Store,
    private router: Router,
    private errorService: ErrorService,
    private sanitizer: DomSanitizer
  ) {}

  showSizeControls() {
    let code = this.reportTemplateForm.get('code')?.value;
    return (
      code === 'INVOICE_TEMPLATE' ||
      code === 'PROOF_OF_PAYMENT_TEMPLATE' ||
      code === 'RECEIVABLE_PROOF_OF_PAYMENT_TEMPLATE'
    );
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
      default:
        return 'Desconocido';
    }
  }

  getTemplate() {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.reportTemplateForm.get('template')?.value ?? ''
    );
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

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
    this.canCreate = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Create
    );
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  onSubmit() {
    if (this.reportTemplateForm.valid) {
      this.updateReporteTemplate();
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  clearFormOnUpdate() {
    this.clearForm();
    this.toastService.showSucess('Registro actualizado');
    this.spinner.hide('fullscreen');
    this.router.navigate(['/general/report-template/list']);
  }

  updateReporteTemplate() {
    const value = {
      ...this.reportTemplateForm.value,
    };
    this.spinner.show('fullscreen');
    const sub = this.printInformationService
      .updateReportTemplate(value as ReportTemplateModel)
      .subscribe({
        next: () => {
          this.clearFormOnUpdate();
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error actualizando template de reporte'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/general/report-template/list']);
  }

  clearForm() {
    this.reportTemplateForm.reset();
    this.isEdit = false;
  }

  setFormValues(reporteTemplate: ReportTemplateModel) {
    this.reportTemplateForm.setValue({
      id: reporteTemplate.id,
      code: reporteTemplate.code,
      template: reporteTemplate.template,
      width: <any>reporteTemplate.width,
      height: <any>reporteTemplate.height,
    });
  }

  computeWidth() {
    let _with = this.reportTemplateForm.get('width')?.value;
    if (_with) {
      return _with + 'mm';
    } else {
      return '100%';
    }
  }

  computeHeight() {
    let heitht = this.reportTemplateForm.get('height')?.value;
    console.log(heitht);
    if (heitht) {
      return heitht + 'mm';
    } else {
      return '700px';
    }
  }

  loadReportTemplate() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.printInformationService.getReporteTemplateById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (reportTemplate: ReportTemplateModel | null) => {
          if (reportTemplate) {
            this.setFormValues(reportTemplate);
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error cargando información de impresión'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }
}
