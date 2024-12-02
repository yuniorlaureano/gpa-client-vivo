import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, Subscription, switchMap } from 'rxjs';
import { FilterModel } from '../../../core/models/filter.model';
import { ReportService } from '../../service/report.service';
import { downloadFile } from '../../../core/utils/file.utils';
import { RawAllInvoice } from '../../models/raw-all-invoice';
import { InvoiceStatusEnum } from '../../../core/models/invoice-status.enum';
import { PaymentMethodEnum } from '../../../core/models/payment-method.enum';
import { getPaymentMethodLabel } from '../../../core/utils/invoice.utils';
import { PaymentStatusEnum } from '../../../core/models/payment-status.enum';

@Component({
  selector: 'gpa-sale-report',
  templateUrl: './sale-report.component.html',
  styleUrl: './sale-report.component.css',
})
export class SaleReportComponent implements OnDestroy, OnInit {
  data: RawAllInvoice[] = [];
  subscriptions$: Subscription[] = [];
  search: string = '';
  searchTerms = new Subject<string>();
  $download = new Subject<void>();
  $sales = new Subject<void>();
  filterForm = this.fb.group({
    term: [''],
    status: ['-1'],
    saleType: ['-1'],
    from: [null],
    to: [null],
  });

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.initDownload();
    this.initGetSale();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleSearch() {
    if (
      (this.filterForm.get('from')?.value &&
        !this.filterForm.get('to')?.value) ||
      (!this.filterForm.get('from')?.value && this.filterForm.get('to')?.value)
    ) {
      return;
    }

    this.search = JSON.stringify({
      ...this.filterForm.value,
      status: parseInt(this.filterForm.get('status')?.value ?? '-1'),
      saleType: parseInt(this.filterForm.get('saleType')?.value ?? '-1'),
    });
  }

  resetSearchFilter() {
    this.filterForm.reset();
    this.search = '';
  }

  initDownload() {
    const sub = this.$download
      .pipe(
        switchMap(() => {
          this.spinner.show('table-spinner');
          let searchModel = new FilterModel();
          searchModel.search = this.search;
          return this.reportService.saleReport(searchModel);
        })
      )
      .subscribe({
        next: (data) => {
          downloadFile(data, 'ventas.pdf');
          this.spinner.hide('table-spinner');
        },
        error: () => {
          this.spinner.hide('table-spinner');
        },
      });

    this.subscriptions$.push(sub);
  }

  initGetSale() {
    const sub = this.$sales
      .pipe(
        switchMap(() => {
          this.spinner.show('table-spinner');
          let searchModel = new FilterModel();
          searchModel.search = this.search;
          return this.reportService.getSale(searchModel);
        })
      )
      .subscribe({
        next: (data) => {
          this.data = data;
          this.spinner.hide('table-spinner');
        },
        error: () => {
          this.spinner.hide('table-spinner');
        },
      });

    this.subscriptions$.push(sub);
  }

  getStatusDescription(status: InvoiceStatusEnum) {
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

  paymentMethodLabel(paymentMethod: PaymentMethodEnum) {
    return getPaymentMethodLabel(paymentMethod);
  }

  getPyamentStatusDescription(status: PaymentStatusEnum) {
    switch (status) {
      case PaymentStatusEnum.Paid:
        return 'Pagado';
      case PaymentStatusEnum.Pending:
        return 'Pendiente';
      default:
        return '';
    }
  }
}
