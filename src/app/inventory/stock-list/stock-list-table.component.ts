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
import { RawProductCatalogModel } from '../models/raw-product-catalog.model';

@Component({
  selector: 'gpa-stock-list-table',
  templateUrl: './stock-list-table.component.html',
  styleUrl: './stock-list-table.component.css',
})
export class StockListTableComponent {
  @Output() onDelete = new EventEmitter<RawProductCatalogModel>();
  @Output() onEdit = new EventEmitter<RawProductCatalogModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
  });
  public data: DataTableDataModel<RawProductCatalogModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };

  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    let searchModel = new SearchModel();
    this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          return this.stockService.getProductCatalog(searchModel);
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

  handleEdit(model: RawProductCatalogModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: RawProductCatalogModel) {
    this.onDelete.emit(model);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reloadTable'] && !changes['reloadTable'].firstChange) {
      this.pageOptionsSubject.next({ ...this.searchOptions });
    }
  }

  handleSetPageToShow = (value: number) => {
    this.pageOptionsSubject.next({ ...this.searchOptions, pageSize: value });
  };

  handleForwardPage = (page: number): void => {
    this.pageOptionsSubject.next({ ...this.searchOptions, page: page });
  };

  handleBackwardPage = (page: number): void => {
    this.pageOptionsSubject.next({ ...this.searchOptions, page: page });
  };
}
