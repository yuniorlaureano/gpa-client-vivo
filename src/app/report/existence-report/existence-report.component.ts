import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReportService } from '../service/report.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  BehaviorSubject,
  debounceTime,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { downloadFile } from '../../core/utils/file.utils';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { DEFAULT_SEARCH_PARAMS } from '../../core/models/util.constants';
import { FormBuilder } from '@angular/forms';
import { FilterModel } from '../../core/models/filter.model';
import { processError } from '../../core/utils/error.utils';
import { ToastService } from '../../core/service/toast.service';
import { ExistenceModel } from '../../inventory/models/existence.model';

@Component({
  selector: 'gpa-existence-report',
  templateUrl: './existence-report.component.html',
  styleUrl: './existence-report.component.css',
})
export class ExistenceReportComponent implements OnInit, OnDestroy {
  subscriptions$: Subscription[] = [];
  searchOptions: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };
  searchTerms = new Subject<string>();
  filterForm = this.fb.group({
    term: [''],
    type: [''],
  });
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  data: ExistenceModel[] = [];

  constructor(
    private reportService: ReportService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.initSearch();
    this.loadExistence();
  }

  handleSearch() {
    this.spinner.show('table-spinner');
    this.searchTerms.next(
      JSON.stringify({
        ...this.filterForm.value,
        type: parseInt(this.filterForm.get('type')?.value ?? '0'),
      })
    );
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

  downloadAttachment(name: string) {
    this.spinner.show('fullscreen');
    const sub = this.reportService.existenceReport().subscribe({
      next: (data) => {
        downloadFile(data, name);
        this.spinner.hide('fullscreen');
      },
      error: () => {
        this.spinner.hide('fullscreen');
      },
    });
    this.subscriptions$.push(sub);
  }

  loadExistence() {
    let searchModel = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((search) => {
          this.spinner.show('table-spinner');
          searchModel.page = search.page;
          searchModel.pageSize = search.pageSize;
          searchModel.search = search.search;
          return this.reportService.getExistence(searchModel);
        })
      )
      .subscribe({
        next: (data) => {
          this.searchOptions = {
            page: searchModel.page,
            pageSize: searchModel.pageSize,
            count: 1000,
            search: searchModel.search,
          };
          this.data = data;
          // {
          //   data: data,
          //   options: {
          //     ...this.searchOptions,
          //     search: searchModel.search,
          //     filteredSize: data.data.length,
          //   },
          // };
          this.spinner.hide('table-spinner');
        },
        error: (error) => {
          processError(error.error, 'Error cargando existencias').forEach(
            (err) => {
              this.toast.showError(err);
            }
          );
          this.spinner.hide('table-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }
}
