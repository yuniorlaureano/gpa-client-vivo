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
import {
  BehaviorSubject,
  debounceTime,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { StockService } from '../service/stock.service';
import { ExistenceModel } from '../models/existence.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { FormBuilder } from '@angular/forms';
import { processError } from '../../core/utils/error.utils';
import { ReportService } from '../../report/service/report.service';
import { downloadFile } from '../../core/utils/file.utils';

@Component({
  selector: 'gpa-existence-list-table',
  templateUrl: './existence-list-table.component.html',
  styleUrl: './existence-list-table.component.css',
})
export class ExistenceListTableComponent implements OnInit, OnDestroy {
  @Output() onDelete = new EventEmitter<ExistenceModel>();
  @Output() onEdit = new EventEmitter<ExistenceModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  public data: DataTableDataModel<ExistenceModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canReadExistence: boolean = false;

  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };
  searchTerms = new Subject<string>();
  filterForm = this.fb.group({
    term: [''],
    type: [''],
  });

  constructor(
    private stockService: StockService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private store: Store,
    private fb: FormBuilder,
    private reportService: ReportService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadExistence();
    });
    this.initSearch();
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
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
          onPermissionLoad();
        },
      });
    this.subscriptions$.push(sub);
  }

  setPermissions(requiredPermissions: RequiredPermissionType) {
    this.canReadExistence = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.ReadExistence
    );
  }

  handleSearch() {
    this.spinner.show('table-spinner');
    this.searchTerms.next(
      JSON.stringify({
        ...this.filterForm.value,
        type: parseInt(this.filterForm.get('type')?.value ?? '0'),
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

  handleEdit(model: ExistenceModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: ExistenceModel) {
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

  downloadExistenceAsExcel() {
    this.spinner.show('fullscreen');
    let searchModel = new FilterModel();
    searchModel.search = this.searchOptions.search;
    const sub = this.reportService.existenceReport(searchModel).subscribe({
      next: (data) => {
        downloadFile(data, 'reporte_existencias.xlsx');
        this.spinner.hide('fullscreen');
      },
      error: () => {
        this.spinner.hide('fullscreen');
      },
    });
    this.subscriptions$.push(sub);
  }

  loadExistence() {
    let searchModel = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          searchModel.search = search.search;
          return this.stockService.getExistence(searchModel);
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
          processError(
            error.error || error,
            'Error cargando existencias'
          ).forEach((err) => {
            this.toastService.showError(err);
          });
          this.spinner.hide('table-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }
}
