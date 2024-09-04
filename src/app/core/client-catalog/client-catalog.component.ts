import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { FilterModel } from '../models/filter.model';
import { SearchOptionsModel } from '../models/search-options.model';
import { ClientService } from '../../invoice/service/client.service';
import { ClientModel } from '../../invoice/model/client.model';
import { ToastService } from '../service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../utils/error.utils';

@Component({
  selector: 'gpa-client-catalog',
  templateUrl: './client-catalog.component.html',
  styleUrl: './client-catalog.component.css',
})
export class ClientCatalogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelectedClient = new EventEmitter<ClientModel>();
  @Input() selectedClientes: { [index: string]: boolean } = {};
  searchTerms = new Subject<string>();
  subscriptions$: Subscription[] = [];
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  clients!: ClientModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  };

  constructor(
    private clientService: ClientService,
    private toastService: ToastService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.initSearch();
  }

  ngOnDestroy(): void {
    this.handleHide();
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
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

  handleSelectedClientFromCatalog(client: ClientModel) {
    this.onSelectedClient.emit(client);
  }

  loadClients() {
    const search = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          this.spinner.show('client-catalog-spinner');
          search.page = options.page;
          search.pageSize = options.pageSize;
          search.search = options.search;
          return this.clientService.getClients(search);
        })
      )
      .subscribe({
        next: (model) => {
          this.clients = model.data;
          this.options = {
            ...this.options,
            count: model.count,
          };
          this.spinner.hide('client-catalog-spinner');
        },
        error: (error) => {
          processError(error.error, 'Error cargando clientes').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
          this.spinner.hide('client-catalog-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }

  handleSearch(event: any) {
    this.spinner.show('client-catalog-spinner');
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

  handleHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}
