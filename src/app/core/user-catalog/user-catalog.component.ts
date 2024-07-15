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
import { SearchModel } from '../models/search.model';
import { SearchOptionsModel } from '../models/search-options.model';
import { UserModel } from '../../security/model/user.model';
import { UserService } from '../../security/service/user.service';

@Component({
  selector: 'gpa-user-catalog',
  templateUrl: './user-catalog.component.html',
  styleUrl: './user-catalog.component.css',
})
export class UserCatalogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() reloadTable: number = 1;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelectedUser = new EventEmitter<UserModel>();
  @Input() selectedProfile: string = '';
  userSubscription!: Subscription;
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
  });
  users!: UserModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
  };

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reloadTable'] && !changes['reloadTable'].firstChange) {
      this.pageOptionsSubject.next({ ...this.options });
    }
  }

  ngOnInit(): void {
    this.loadUsers();
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

  handleSelectedUserFromCatalog(user: UserModel) {
    this.onSelectedUser.emit(user);
  }

  loadUsers() {
    const search = new SearchModel();
    this.userSubscription = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          search.page = options.page;
          return this.userService.getUsers(search);
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
      });
  }
}
