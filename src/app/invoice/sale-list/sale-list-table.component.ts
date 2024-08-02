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
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';

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
    private toastService: ToastService,
    private store: Store
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad();
    this.loadInvoices();
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

  loadInvoices() {
    let searchModel = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
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
          this.spinner.hide('table-spinner');
          this.toastService.showError('Error al cargar las facturas');
        },
      });
    this.subscriptions$.push(sub);
  }
}
