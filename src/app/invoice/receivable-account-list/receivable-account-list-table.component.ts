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
import { ReceivableAccountService } from '../service/receivable-account.service';
import { ReceivableAccountSummaryModel } from '../model/receivable-account-summary.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-receivable-account-list-table',
  templateUrl: './receivable-account-list-table.component.html',
  styleUrl: './receivable-account-list-table.component.css',
})
export class ReceivableAccountListTableComponent {
  @Output() onDelete = new EventEmitter<ReceivableAccountSummaryModel>();
  @Output() onEdit = new EventEmitter<ReceivableAccountSummaryModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
  });
  public data: DataTableDataModel<ReceivableAccountSummaryModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };

  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };

  constructor(
    private receivableAccountService: ReceivableAccountService,
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
          return this.receivableAccountService.getReceivableAccountSummary(
            searchModel
          );
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

  isPedding(model: ReceivableAccountSummaryModel) {
    return model.payment != model.pendingPayment;
  }

  handleEdit(model: ReceivableAccountSummaryModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: ReceivableAccountSummaryModel) {
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
