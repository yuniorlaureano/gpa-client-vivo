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
import { StockService } from '../service/stock.service';
import { ExistenceModel } from '../models/existence.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../core/service/toast.service';

@Component({
  selector: 'gpa-existence-list-table',
  templateUrl: './existence-list-table.component.html',
  styleUrl: './existence-list-table.component.css',
})
export class ExistenceListTableComponent {
  @Output() onDelete = new EventEmitter<ExistenceModel>();
  @Output() onEdit = new EventEmitter<ExistenceModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
  });
  public data: DataTableDataModel<ExistenceModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };

  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };

  constructor(
    private stockService: StockService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    let searchModel = new SearchModel();
    this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          return this.stockService.getExistence(searchModel);
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
          this.spinner.hide('table-spinner');
        },
        error: (error) => {
          this.spinner.hide('table-spinner');
          this.toastService.showError('Error cargando existencias');
        },
      });
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
}
