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
import { InvoiceService } from '../service/invoice.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { ReceivableAccountModel } from '../model/receivable-account.model';
import { ReceivableAccountService } from '../service/receivable-account.service';

@Component({
  selector: 'gpa-receivable-account-list-table',
  templateUrl: './receivable-account-list-table.component.html',
  styleUrl: './receivable-account-list-table.component.css',
})
export class ReceivableAccountListTableComponent {
  @Output() onDelete = new EventEmitter<ReceivableAccountModel>();
  @Output() onEdit = new EventEmitter<ReceivableAccountModel>();
  @Input() reloadTable: number = 1;

  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
  });
  public data: DataTableDataModel<ReceivableAccountModel> = {
    data: [],
    options: {
      ...DEFAULT_SEARCH_PARAMS,
      filteredSize: 0,
      count: 0,
    },
  };

  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };

  constructor(private receivableAccountService: ReceivableAccountService) {}

  ngOnInit(): void {
    let searchModel = new SearchModel();
    this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          return this.receivableAccountService.getReceivableAccounts(
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
        },
      });
  }

  isPedding(model: ReceivableAccountModel) {
    return model.payment < model.pendingPayment;
  }

  handleEdit(model: ReceivableAccountModel) {
    this.onEdit.emit(model);
  }

  handleDelete(model: ReceivableAccountModel) {
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
