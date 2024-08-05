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
import { BehaviorSubject, debounceTime, from, Subject, switchMap } from 'rxjs';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { StockCycleService } from '../service/cycle.service';
import { StockCycleModel } from '../models/stock-cycle.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'gpa-stock-cycle-list-table',
  templateUrl: './stock-cycle-list-table.component.html',
  styleUrl: './stock-cycle-list-table.component.css',
})
export class StockCycleListTableComponent implements OnInit, OnDestroy {
  @Output() onDelete = new EventEmitter<StockCycleModel>();
  @Output() onEdit = new EventEmitter<StockCycleModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  public data: DataTableDataModel<StockCycleModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };
  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };
  dateTypeFilter: string = 'init';

  filterForm = this.fb.group({
    dateTypeFilter: ['init'],
    from: [''],
    to: [''],
    isClose: [''],
  });

  constructor(
    private stockCycleService: StockCycleService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private store: Store,
    private fb: FormBuilder
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  //subscriptions
  subscriptions$: Subscription[] = [];
  searchTerms = new Subject<string>();

  //permissions
  canRead: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  ngOnInit(): void {
    this.handlePermissionsLoad();
    this.loadStockCycles();
    this.initSearch();
  }

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Inventory][
            PermissionConstants.Components.StockCycle
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
    this.canDelete = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Delete
    );
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  handleDateTypeFilter(e: any) {
    this.dateTypeFilter = e.target.value;
    this.filterForm.reset();
    this.filterForm.get('dateTypeFilter')?.setValue(this.dateTypeFilter);
  }

  handleSearch() {
    if (
      (this.filterForm.get('from')?.value &&
        !this.filterForm.get('to')?.value) ||
      (!this.filterForm.get('from')?.value && this.filterForm.get('to')?.value)
    ) {
      return;
    }

    this.searchTerms.next(
      JSON.stringify({
        ...this.filterForm.value,
        isClose: parseInt(this.filterForm.get('isClose')?.value ?? '-1'),
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

  loadStockCycles() {
    let searchModel = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          searchModel.search = search.search;
          return this.stockCycleService.getStockCycle(searchModel);
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
          this.toastService.showError('Error al cargar existencias');
        },
      });
    this.subscriptions$.push(sub);
  }

  handleEdit(model: StockCycleModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: StockCycleModel) {
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
}
