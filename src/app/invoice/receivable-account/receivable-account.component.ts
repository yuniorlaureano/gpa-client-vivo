import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReceivableAccountService } from '../service/receivable-account.service';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, Subscription, switchMap } from 'rxjs';
import { InvoiceWithReceivableAccountModel } from '../model/invoice-with-receivable-account';
import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { ReceivableAccountModel } from '../model/receivable-account.model';
import { ToastService } from '../../core/service/toast.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { PaymentStatusEnum } from '../../core/models/payment-status.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';

@Component({
  selector: 'gpa-receivable-account',
  templateUrl: './receivable-account.component.html',
  styleUrl: './receivable-account.component.css',
})
export class ReceivableAccountComponent implements OnInit, OnDestroy {
  isEdit: boolean = false;
  invoice: InvoiceWithReceivableAccountModel | null = null;
  invoiceIdSubject$ = new Subject<string | null>();
  receivableForm = this.form.group({
    id: [''],
    payment: [0.0, [Validators.required, Validators.min(1)]],
    date: [null, Validators.required],
    note: [null],
    invoiceId: ['', Validators.required],
  });

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  constructor(
    private receivableAccountService: ReceivableAccountService,
    private route: ActivatedRoute,
    private form: FormBuilder,
    private toastService: ToastService,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.getInvoice();
    this.handlePermissionsLoad();
    const sub = this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        this.invoiceIdSubject$.next(id);
      },
    });
    this.subscriptions$.push(sub);
  }

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Invoice][
            PermissionConstants.Components.ReceivableAccount
          ]
      )
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
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
    this.canDelete = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Delete
    );
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  handleSave() {
    const payment = parseFloat(
      String(this.receivableForm.get('payment')?.value || 0)
    );
    const pendingPayment = this.invoice?.pendingPayment?.pendingPayment ?? 0;

    this.confirmService
      .confirm(
        'Cuentas por cobrar',
        `Está seguro de realizar el pago de: ${payment}? 
      Con ${pendingPayment - payment} pendientes`
      )
      .then(() => {
        this.update();
      })
      .catch(() => {});
  }

  update() {
    this.receivableForm.markAllAsTouched();
    const canEdit =
      this.isEdit &&
      this.receivableForm.valid &&
      this.receivableForm.get('id')?.value;

    if (canEdit) {
      this.spinner.show('fullscreen');
      const value: ReceivableAccountModel = {
        id: this.receivableForm.get('id')?.value ?? '',
        payment: this.receivableForm.get('payment')?.value ?? 0.0,
        date: this.receivableForm.get('date')?.value ?? {},
        pendingPayment: 0.0,
        invoiceId: this.receivableForm.get('invoiceId')?.value ?? '',
      };

      const sub = this.receivableAccountService
        .updateReceivableAccount(value)
        .subscribe({
          next: () => {
            this.toastService.showSucess('Pago realizado');
            this.receivableForm.reset();
            this.invoiceIdSubject$.next(this.invoice?.invoiceId ?? null);
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            this.toastService.showError('Error al realizar el pago');
          },
        });
      this.subscriptions$.push(sub);
    }
  }

  getStatusDescription(status: InvoiceStatusEnum | undefined) {
    switch (status) {
      case InvoiceStatusEnum.Saved:
        return 'Guardado';
      case InvoiceStatusEnum.Draft:
        return 'Borrador';
      case InvoiceStatusEnum.Canceled:
        return 'Cancelado';
      default:
        return '';
    }
  }

  getPaymentStatusDescription(status?: PaymentStatusEnum) {
    switch (status) {
      case PaymentStatusEnum.Pending:
        return 'Pendiente de pagar';
      case PaymentStatusEnum.Payed:
        return 'Pagada';
      default:
        return '';
    }
  }

  getInvoice() {
    const sub = this.invoiceIdSubject$
      .pipe(
        switchMap((id) => {
          this.spinner.show('fullscreen');
          if (id == null) {
            this.isEdit = false;
            return of(null);
          }
          this.isEdit = true;
          return this.receivableAccountService.getReceivableAccountsByInvoiceId(
            id
          );
        })
      )
      .subscribe({
        next: (invoice) => {
          if (invoice) {
            this.receivableForm.setValue({
              id: invoice.pendingPayment?.id ?? null,
              payment: 0.0,
              date: null,
              note: null,
              invoiceId: invoice.invoiceId,
            });
            this.invoice = invoice;
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al cargar la factura');
        },
      });
    this.subscriptions$.push(sub);
  }
}
