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
import { StockCycleService } from '../service/cycle.service';
import { StockCycleModel } from '../models/stock-cycle.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-stock-cycle-list-table',
  templateUrl: './stock-cycle-list-table.component.html',
  styleUrl: './stock-cycle-list-table.component.css',
})
export class StockCycleListTableComponent {
  @Output() onDelete = new EventEmitter<StockCycleModel>();
  @Output() onEdit = new EventEmitter<StockCycleModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
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

  constructor(
    private stockCycleService: StockCycleService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    let searchModel = new SearchModel();
    this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          return this.stockCycleService.getStockCycle(searchModel);
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
      });
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
