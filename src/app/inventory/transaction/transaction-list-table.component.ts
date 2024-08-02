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
import { FilterModel } from '../../core/models/filter.model';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { StockService } from '../service/stock.service';
import { StockModel } from '../models/stock.model';
import { StockStatusEnum } from '../../core/models/stock-status.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';

@Component({
  selector: 'gpa-transaction-list-table',
  templateUrl: './transaction-list-table.component.html',
  styleUrl: './transaction-list-table.component.css',
})
export class TransactionListTableComponent implements OnInit, OnDestroy {
  @Output() onDelete = new EventEmitter<StockModel>();
  @Output() onEdit = new EventEmitter<StockModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  public data: DataTableDataModel<StockModel> = {
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
  canReadTransactions: boolean = false;

  constructor(
    private stockService: StockService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad();
    this.loadTransactions();
  }

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Inventory][
            PermissionConstants.Components.Stock
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
    this.canReadTransactions = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.ReadTransactions
    );
  }

  getStatusDescription(status: StockStatusEnum) {
    switch (status) {
      case StockStatusEnum.Saved:
        return 'Guardado';
      case StockStatusEnum.Draft:
        return 'Borrador';
      case StockStatusEnum.Canceled:
        return 'Cancelado';
      default:
        return '';
    }
  }

  handleEdit(model: StockModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: StockModel) {
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

  loadTransactions() {
    let searchModel = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          return this.stockService.getStockMaster(searchModel);
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
          this.toastService.showError('Error al cargar transacciones.');
        },
      });
    this.subscriptions$.push(sub);
  }
}
