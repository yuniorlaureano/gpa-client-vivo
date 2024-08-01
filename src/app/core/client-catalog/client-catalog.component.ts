import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { SearchModel } from '../models/search.model';
import { SearchOptionsModel } from '../models/search-options.model';
import { ClientService } from '../../invoice/service/client.service';
import { ClientModel } from '../../invoice/model/client.model';
import { ToastService } from '../service/toast.service';

@Component({
  selector: 'gpa-client-catalog',
  templateUrl: './client-catalog.component.html',
  styleUrl: './client-catalog.component.css',
})
export class ClientCatalogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelectedClient = new EventEmitter<ClientModel>();
  clientSubscription!: Subscription;
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
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.handleHide();
    this.clientSubscription.unsubscribe();
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
    const search = new SearchModel();
    this.clientSubscription = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          search.page = options.page;
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
        },
        error: (error) => {
          this.toastService.showError('Error cargando clientes');
        },
      });
  }

  handleHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}
