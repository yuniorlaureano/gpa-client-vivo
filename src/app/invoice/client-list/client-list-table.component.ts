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
import { ClientModel } from '../model/client.model';
import { ClientService } from '../service/client.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { FormBuilder } from '@angular/forms';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';

@Component({
  selector: 'gpa-client-list-table',
  templateUrl: './client-list-table.component.html',
  styleUrl: './client-list-table.component.css',
})
export class ClientListTableComponent implements OnInit, OnDestroy {
  @Output() onDelete = new EventEmitter<ClientModel>();
  @Output() onEdit = new EventEmitter<ClientModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  public data: DataTableDataModel<ClientModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };

  searchTerms = new Subject<string>();
  filterForm = this.fb.group({
    term: [''],
  });
  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  constructor(
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private store: Store,
    private fb: FormBuilder,
    private errorService: ErrorService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadClients();
    });
    this.initSearch();
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Invoice][
            PermissionConstants.Components.Client
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

  handleEdit(model: ClientModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: ClientModel) {
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
    this.searchTerms.next(this.filterForm.get('term')?.value ?? '');
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

  getIdentificationType(type: number) {
    switch (type) {
      case 1:
        return 'Cédula';
      case 2:
        return 'RNC';
      case 3:
        return 'Pasaporte';
      default:
        return 'Otro';
    }
  }

  loadClients() {
    let searchModel = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          searchModel.search = search.search;
          return this.clientService.getClients(searchModel);
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
          processError(error.error || error, 'Error cargando clientes').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
          this.spinner.hide('table-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }
}
