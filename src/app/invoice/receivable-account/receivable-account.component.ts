import { Component, OnInit } from '@angular/core';
import { ReceivableAccountService } from '../service/receivable-account.service';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { InvoiceWithReceivableAccountModel } from '../model/invoice-with-receivable-account';
import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { ReceivableAccountModel } from '../model/receivable-account.model';
import { ToastService } from '../../core/service/toast.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';

@Component({
  selector: 'gpa-receivable-account',
  templateUrl: './receivable-account.component.html',
  styleUrl: './receivable-account.component.css',
})
export class ReceivableAccountComponent implements OnInit {
  isEdit: boolean = false;
  invoice: InvoiceWithReceivableAccountModel | null = null;

  receivableForm = this.form.group({
    id: [''],
    payment: [0.0, [Validators.required, Validators.min(1)]],
    date: [null, Validators.required],
    note: [null, Validators.required],
    invoiceId: ['', Validators.required],
  });

  constructor(
    private receivableAccountService: ReceivableAccountService,
    private route: ActivatedRoute,
    private form: FormBuilder,
    private toastService: ToastService,
    private confirmService: ConfirmModalService
  ) {}

  ngOnInit(): void {
    this.getInvoice();
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
        this.save();
      })
      .catch(() => {});
  }

  save() {
    this.receivableForm.markAllAsTouched();
    const canEdit =
      this.isEdit &&
      this.receivableForm.valid &&
      this.receivableForm.get('id')?.value;
    if (canEdit) {
      const value: ReceivableAccountModel = {
        id: this.receivableForm.get('id')?.value ?? '',
        payment: this.receivableForm.get('payment')?.value ?? 0.0,
        date: this.receivableForm.get('date')?.value ?? {},
        pendingPayment: 0.0,
        invoiceId: this.receivableForm.get('invoiceId')?.value ?? '',
      };
      this.receivableAccountService.updateReceivableAccount(value).subscribe({
        next: () => {
          this.toastService.showSucess('Pago realizado');
          this.receivableForm.reset();
          this.getInvoice();
        },
      });
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

  getInvoice() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
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
      .subscribe((invoice) => {
        if (invoice) {
          this.receivableForm.setValue({
            id: invoice.pendingPayment?.id ?? null,
            payment: 0.0,
            date: null,
            note: null,
            invoiceId: invoice.invoiceId,
          });
          this.invoice = invoice;
          console.log(this.invoice.pendingPayment);
        }
      });
  }
}
