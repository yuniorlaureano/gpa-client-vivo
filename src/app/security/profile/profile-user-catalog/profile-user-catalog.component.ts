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
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { SearchOptionsModel } from '../../../core/models/search-options.model';
import { SearchModel } from '../../../core/models/search.model';
import { ProfileService } from '../../service/profile.service';
import { RawUserModel } from '../../model/raw-user.model';
import { ProfileModel } from '../../model/profile.model';
import { ToastService } from '../../../core/service/toast.service';

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

  //permissions
  @Input() canAssignUser: boolean = false;
  @Input() canUnAssignUser: boolean = false;

  constructor(
    private profileService: ProfileService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reloadTable'] && !changes['reloadTable'].firstChange) {
      this.pageOptionsSubject.next({ ...this.options });
    }
  }

  ngOnDestroy(): void {
    this.handleShowUserCatalog(false);
    this.userSubscription.unsubscribe();
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

  loadUsers() {
    const search = new SearchModel();
    this.userSubscription = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          search.page = options.page;
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
        },
        error: (error) => {
          this.toastService.showError('Error cargando usuarios');
        },
      });
  }
}
