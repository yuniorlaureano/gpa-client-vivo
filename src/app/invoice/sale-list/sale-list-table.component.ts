import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DEFAULT_SEARCH_PARAMS } from '../../core/models/util.constants';
import { DataTableDataModel } from '../../core/models/data-table-data.model';
import { InvoiceModel } from '../model/invoice.model';
import { FilterModel } from '../../core/models/filter.model';
import { InvoiceService } from '../service/invoice.service';
import {
  BehaviorSubject,
  debounceTime,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { FormBuilder } from '@angular/forms';
import { PaymentStatusEnum } from '../../core/models/payment-status.enum';
import { processError } from '../../core/utils/error.utils';
import { downloadFile } from '../../core/utils/file.utils';
import { ReportService } from '../../report/service/report.service';
import { ErrorService } from '../../core/service/error.service';

@Component({
  selector: 'gpa-sale-list-table',
  templateUrl: './sale-list-table.component.html',
  styleUrl: './sale-list-table.component.css',
})
export class SaleListTableComponent implements OnInit, OnDestroy {
  @Output() onDelete = new EventEmitter<InvoiceModel>();
  @Output() onEdit = new EventEmitter<InvoiceModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  public data: DataTableDataModel<InvoiceModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };

  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };
  searchTerms = new Subject<string>();
  filterForm = this.fb.group({
    term: [''],
    status: ['-1'],
    saleType: ['-1'],
    from: [null],
    to: [null],
  });

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  constructor(
    private invoiceService: InvoiceService,
    private spinner: NgxSpinnerService,
    private store: Store,
    private fb: FormBuilder,
    private reportService: ReportService,
    private errorService: ErrorService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadInvoices();
    });
    this.initSearch();
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
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
    this.canDelete = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Delete
    );
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
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

  handleEdit(model: InvoiceModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: InvoiceModel) {
    this.onDelete.emit(model);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reloadTable'] && !changes['reloadTable'].firstChange) {
      this.pageOptionsSubject.next({ ...this.searchOptions });
    }
  }

  handleSetPageToShow = (value: number) => {
    this.pageOptionsSubject.next({
      ...this.searchOptions,
      page: 1,
      pageSize: value,
    });
  };

  handleForwardPage = (page: number): void => {
    this.pageOptionsSubject.next({ ...this.searchOptions, page: page });
  };

  handleBackwardPage = (page: number): void => {
    this.pageOptionsSubject.next({ ...this.searchOptions, page: page });
  };

  handleSearch() {
    this.spinner.show('table-spinner');
    if (
      (this.filterForm.get('from')?.value &&
        !this.filterForm.get('to')?.value) ||
      (!this.filterForm.get('from')?.value && this.filterForm.get('to')?.value)
    ) {
      this.spinner.hide('table-spinner');
      return;
    }

    this.searchTerms.next(
      JSON.stringify({
        ...this.filterForm.value,
        status: parseInt(this.filterForm.get('status')?.value ?? '-1'),
        saleType: parseInt(this.filterForm.get('saleType')?.value ?? '-1'),
      })
    );
  }

  initSearch() {
    const sub = this.searchTerms
      .pipe(
        debounceTime(300) // Adjust the time (in milliseconds) as needed
      )
      .subscribe((search) => {
        this.pageOptionsSubject.next({ ...this.searchOptions, search: search });
      });
    this.subscriptions$.push(sub);
  }

  loadInvoices() {
    let searchModel = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          searchModel.search = search.search;
          return this.invoiceService.getInvoices(searchModel);
        })
      )
      .subscribe({
        next: (data) => {
          this.searchOptions = {
            page: searchModel.page,
            pageSize: searchModel.pageSize,
            count: data.count,
            search: searchModel.search,
          };
          this.data = {
            data: data.data,
            options: {
              ...this.searchOptions,
              search: searchModel.search,
              filteredSize: data.data.length,
            },
          };
          this.spinner.hide('table-spinner');
        },
        error: (error) => {
          processError(error.error || error, 'Error cargando facturas').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
          this.spinner.hide('table-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }

  resetSearchFilter() {
    this.filterForm.reset();
    this.handleSearch();
  }

  downloadSaleReport() {
    this.spinner.show('fullscreen');
    let searchModel = new FilterModel();
    searchModel.search = this.searchOptions.search;
    const sub = this.reportService.saleReport(searchModel).subscribe({
      next: (data) => {
        downloadFile(data, 'stock-cycle-details.pdf');
        this.spinner.hide('fullscreen');
      },
      error: () => {
        this.spinner.hide('fullscreen');
      },
    });
    this.subscriptions$.push(sub);
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
