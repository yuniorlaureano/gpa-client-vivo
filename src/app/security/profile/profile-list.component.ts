import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DEFAULT_SEARCH_PARAMS } from '../../core/models/util.constants';
import { DataTableDataModel } from '../../core/models/data-table-data.model';
import { SearchModel } from '../../core/models/search.model';
import { BehaviorSubject, switchMap } from 'rxjs';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { ProfileModel } from '../model/profile.model';
import { ProfileService } from '../service/profile.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { ToastService } from '../../core/service/toast.service';
import { RawUserModel } from '../model/raw-user.model';

@Component({
  selector: 'gpa-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrl: './profile-list.component.css',
})
export class ProfileListComponent {
  reloadProfileUserTable: number = 1;
  @Input() isProfileUserCatalogVisible: boolean = false;
  selectedProfile!: ProfileModel | null;
  @Input() reloadTable: number = 1;
  @Output() onDelete = new EventEmitter<ProfileModel>();
  @Output() onEdit = new EventEmitter<ProfileModel>();
  @Output() onView = new EventEmitter<ProfileModel>();

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
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

  constructor(
    private profileService: ProfileService,
    private confirmService: ConfirmModalService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
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
    this.selectedProfile = model;
    this.isProfileUserCatalogVisible = true;
    this.reloadProfileUserTable = this.reloadProfileUserTable * -1;
  }

  handdleUserAdded(user: RawUserModel) {
    this.handleAssignPermission(this.selectedProfile, user);
  }

  handdleUserRemoved(user: RawUserModel) {
    this.handleRemovePermission(this.selectedProfile, user);
  }

  handleAssignPermission(profile: ProfileModel | null, user: RawUserModel) {
    if (!profile) {
      return;
    }

    this.confirmService
      .confirm(
        'Perfil',
        'Está seguro de asignar el usuario:\n ' +
          user.email +
          ' al perfil: \n ' +
          profile.name
      )
      .then(() => {
        this.profileService.assignUser(profile.id!, user.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Usuario asignado');
            this.reloadProfileUserTable = this.reloadProfileUserTable * -1;
          },
          error: (err) => {
            this.toastService.showError('Error asignando usuario. ' + err);
          },
        });
      })
      .catch(() => {});
  }

  handleRemovePermission(profile: ProfileModel | null, user: RawUserModel) {
    if (!profile) {
      return;
    }

    this.confirmService
      .confirm(
        'Perfil',
        'Está seguro de remover el usuario.\n ' +
          ' del perfil: \n ' +
          profile.name
      )
      .then(() => {
        this.profileService.removeUser(profile.id!, user.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Usuario removido');
            this.reloadProfileUserTable = this.reloadProfileUserTable * -1;
          },
          error: (err) => {
            this.toastService.showError('Error removiendo usuario. ' + err);
          },
        });
      })
      .catch(() => {});
  }

  loadProfiles() {
    let searchModel = new SearchModel();
    this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          return this.profileService.getProfiles(searchModel);
        })
      )
      .subscribe({
        next: (data) => {
          this.searchOptions = {
            page: searchModel.page,
            pageSize: searchModel.pageSize,
            count: data.count,
          };
          this.data = {
            data: data.data,
            options: {
              ...this.searchOptions,
              search: searchModel.search,
              filteredSize: data.data.length,
            },
          };
        },
      });
  }
}
