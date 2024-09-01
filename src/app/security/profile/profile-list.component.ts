import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
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
import { ProfileModel } from '../model/profile.model';
import { ProfileService } from '../service/profile.service';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrl: './profile-list.component.css',
})
export class ProfileListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() reloadTable: number = 1;
  @Output() onDelete = new EventEmitter<ProfileModel>();
  @Output() onEdit = new EventEmitter<ProfileModel>();
  @Output() onView = new EventEmitter<ProfileModel>();
  @Output() onAddUser = new EventEmitter<ProfileModel>();

  //permissions
  @Input() canEdit: boolean = false;
  @Input() canDelete: boolean = false;
  @Input() canAssignUser: boolean = false;
  @Input() canUnAssignUser: boolean = false;

  //subscriptions
  subscriptions$: Subscription[] = [];

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  public data: DataTableDataModel<ProfileModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };

  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };
  searchTerms = new Subject<string>();

  constructor(
    private profileService: ProfileService,
    private toastService: ToastService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadProfiles();
    this.initSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reloadTable'] && !changes['reloadTable'].firstChange) {
      this.pageOptionsSubject.next({ ...this.searchOptions });
    }
  }

  handleForwardPage() {
    const totalPages = Math.ceil(
      this.data.options.count / this.data.options.pageSize
    );
    if (this.data.options.page < totalPages) {
      this.pageOptionsSubject.next({
        ...this.searchOptions,
        page: this.data.options.page + 1,
      });
    }
  }

  handleBackwardPage() {
    if (this.data.options.page > 1) {
      this.pageOptionsSubject.next({
        ...this.searchOptions,
        page: this.data.options.page - 1,
      });
    }
  }

  handleSearch(search: any) {
    this.spinner.show('profile-spinner');
    this.searchTerms.next(search.target.value);
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

  handleSetPageToShow(value: any) {
    this.pageOptionsSubject.next({
      ...this.searchOptions,
      pageSize: Number(value.target.value),
    });
  }

  handleEdit(model: ProfileModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: ProfileModel) {
    this.onDelete.emit(model);
  }

  handleView(model: ProfileModel) {
    this.onView.emit(model);
  }

  handleAddUser(model: ProfileModel) {
    this.onAddUser.emit(model);
  }

  loadProfiles() {
    let searchModel = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('profile-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          searchModel.search = search.search;
          return this.profileService.getProfiles(searchModel);
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
          this.spinner.hide('profile-spinner');
        },
        error: (error) => {
          processError(error.error, 'Error cargando perfiles').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
          this.spinner.hide('profile-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }
}
