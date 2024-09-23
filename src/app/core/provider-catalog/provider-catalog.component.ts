import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { FilterModel } from '../models/filter.model';
import { SearchOptionsModel } from '../models/search-options.model';
import { ProviderModel } from '../../inventory/models/provider.model';
import { ProviderService } from '../../inventory/service/provider.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../utils/error.utils';
import { ErrorService } from '../service/error.service';

@Component({
  selector: 'gpa-provider-catalog',
  templateUrl: './provider-catalog.component.html',
  styleUrl: './provider-catalog.component.css',
})
export class ProviderCatalogComponent implements OnInit, OnDestroy {
  @Input() selectedProviders: { [key: string]: boolean } = {};
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelectedProvider = new EventEmitter<ProviderModel>();
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  providers!: ProviderModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  };
  searchTerms = new Subject<string>();
  subscriptions$: Subscription[] = [];

  constructor(
    private providerService: ProviderService,
    private spinner: NgxSpinnerService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadProviders();
    this.initSearch();
  }

  ngOnDestroy(): void {
    this.handleShowProviderCatalog(false);
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleShowProviderCatalog(visible: boolean) {
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

  getIdentificationType(type: number | null): string {
    switch (type) {
      case 1:
        return 'Cédula';
      case 2:
        return 'RNC';
      case 3:
        return 'Pasaporte';
      default:
        return '';
    }
  }

  handleSelectedProviderFromCatalog(provider: ProviderModel) {
    this.onSelectedProvider.emit(provider);
  }

  handleSearch(event: any) {
    this.spinner.show('provider-catalog-spinner');
    this.searchTerms.next(event.target.value);
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

  loadProviders() {
    const search = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          this.spinner.show('provider-catalog-spinner');
          search.page = options.page;
          search.search = options.search;
          return this.providerService.getProviders(search);
        })
      )
      .subscribe({
        next: (model) => {
          this.providers = model.data;
          this.options = {
            ...this.options,
            count: model.count,
          };
          this.spinner.hide('provider-catalog-spinner');
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error cargando proveedores'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
          this.spinner.hide('provider-catalog-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }
}
