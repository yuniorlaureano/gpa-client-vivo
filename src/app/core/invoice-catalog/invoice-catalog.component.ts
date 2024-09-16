import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { FilterModel } from '../models/filter.model';
import { SearchOptionsModel } from '../models/search-options.model';
import { InvoiceModel } from '../../invoice/model/invoice.model';
import { InvoiceService } from '../../invoice/service/invoice.service';
import { processError } from '../utils/error.utils';
import { ErrorService } from '../service/error.service';

@Component({
  selector: 'gpa-invoice-catalog',
  templateUrl: './invoice-catalog.component.html',
  styleUrl: './invoice-catalog.component.css',
})
export class InvoiceCatalogComponent implements OnInit, OnDestroy {
  @Input() selectedInvoice: InvoiceModel | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelectedInvoice = new EventEmitter<InvoiceModel>();
  invoiceSubscription!: Subscription;
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  invoices: InvoiceModel[] = [];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  };

  constructor(
    private invoiceService: InvoiceService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngOnDestroy(): void {
    this.handleShowInvoiceCatalog(false);
    this.invoiceSubscription.unsubscribe();
  }

  handleShowInvoiceCatalog(visible: boolean) {
    if (!visible) {
      this.visibleChange.emit(visible);
    }
    this.visible = visible;
  }

  handleForwardPage() {
    const totalPages = Math.ceil(this.options.count / this.options.pageSize);
    if (this.options.page < totalPages) {
      this.options = {
        ...this.options,
        page: this.options.page + 1,
      };
      this.pageOptionsSubject.next(this.options);
    }
  }

  handleBackwardPage() {
    if (this.options.page > 1) {
      this.options = {
        ...this.options,
        page: this.options.page - 1,
      };
      this.pageOptionsSubject.next(this.options);
    }
  }

  handleSelectedInvoiceFromCatalog(invoice: InvoiceModel) {
    this.onSelectedInvoice.emit(invoice);
  }

  loadInvoices() {
    const search = new FilterModel();
    this.invoiceSubscription = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          search.page = options.page;
          return this.invoiceService.getInvoices(search);
        })
      )
      .subscribe({
        next: (model) => {
          this.invoices = model.data;
          this.options = {
            ...this.options,
            count: model.count,
          };
        },
        error: (error) => {
          processError(error.error || error, 'Error cargando facturas').forEach(
            (err) => this.errorService.addGeneralError(err)
          );
        },
      });
  }
}
