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
import {
  BehaviorSubject,
  debounceTime,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { SearchOptionsModel } from '../../../core/models/search-options.model';
import { FilterModel } from '../../../core/models/filter.model';
import { ProfileService } from '../../service/profile.service';
import { RawUserModel } from '../../model/raw-user.model';
import { ProfileModel } from '../../model/profile.model';
import { ToastService } from '../../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../../../core/utils/error.utils';
import { ErrorService } from '../../../core/service/error.service';

@Component({
  selector: 'gpa-profile-user-catalog',
  templateUrl: './profile-user-catalog.component.html',
  styleUrl: './profile-user-catalog.component.css',
})
export class ProfileUserCatalogComponent
  implements OnDestroy, OnChanges, OnInit
{
  @Input() reloadTable: number = 1;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onAdd = new EventEmitter<RawUserModel>();
  @Output() onRemove = new EventEmitter<RawUserModel>();
  @Input() selectedProfile: ProfileModel | null = null;
  userSubscription!: Subscription;
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  users!: RawUserModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  };
  searchTerms = new Subject<string>();
  subscriptions$: Subscription[] = [];

  //permissions
  @Input() canAssignUser: boolean = false;
  @Input() canUnAssignUser: boolean = false;

  constructor(
    private profileService: ProfileService,
    private spinner: NgxSpinnerService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.initSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reloadTable'] && !changes['reloadTable'].firstChange) {
      this.pageOptionsSubject.next({ ...this.options });
    }
  }

  ngOnDestroy(): void {
    this.handleShowUserCatalog(false);
    this.userSubscription.unsubscribe();
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleShowUserCatalog(visible: boolean) {
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

  handleAdd(user: RawUserModel) {
    this.onAdd.emit(user);
  }

  handleRemove(user: RawUserModel) {
    this.onRemove.emit(user);
  }

  handleSearch(search: any) {
    this.spinner.show('table-spinner');
    this.searchTerms.next(search.target.value);
  }

  initSearch() {
    const sub = this.searchTerms
      .pipe(
        debounceTime(300) // Adjust the time (in milliseconds) as needed
      )
      .subscribe((search) => {
        this.pageOptionsSubject.next({ ...this.options, search: search });
      });
    this.subscriptions$.push(sub);
  }

  loadUsers() {
    const search = new FilterModel();
    this.userSubscription = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          search.page = options.page;
          search.pageSize = options.pageSize;
          search.search = options.search;
          if (this.selectedProfile?.id) {
            return this.profileService.getUsers(
              this.selectedProfile.id,
              search
            );
          }
          return [];
        })
      )
      .subscribe({
        next: (model) => {
          this.users = model.data;
          this.options = {
            ...this.options,
            count: model.count,
          };
          this.spinner.hide('table-spinner');
        },
        error: (error) => {
          processError(error.error || error, 'Error cargando usuarios').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
          this.spinner.hide('table-spinner');
        },
      });
  }
}
