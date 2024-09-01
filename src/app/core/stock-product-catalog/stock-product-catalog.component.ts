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
import { StockService } from '../../inventory/service/stock.service';
import { ProductCatalogModel } from '../../inventory/models/product-catalog.model';
import { ToastService } from '../service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../utils/error.utils';

@Component({
  selector: 'gpa-stock-product-catalog',
  templateUrl: './stock-product-catalog.component.html',
  styleUrl: './stock-product-catalog.component.css',
})
export class StockProductCatalogComponent implements OnInit, OnDestroy {
  @Input() selectedProducts: { [key: string]: ProductCatalogModel } = {};
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelectedProduct = new EventEmitter<ProductCatalogModel>();
  subscriptions$: Subscription[] = [];
  searchTerms = new Subject<string>();
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  products!: ProductCatalogModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  };

  constructor(
    private stockService: StockService,
    private toastService: ToastService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initSearch();
  }

  ngOnDestroy(): void {
    this.handleShowProductCatalog(false);
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleShowProductCatalog(visible: boolean) {
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

  handleSelectedProductFromCatalog(product: ProductCatalogModel) {
    this.onSelectedProduct.emit(product);
  }

  handleSearch(event: any) {
    this.spinner.show('stock-product-catalog-spinner');
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

  loadProducts() {
    const search = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          this.spinner.show('stock-product-catalog-spinner');
          search.page = options.page;
          search.pageSize = options.pageSize;
          search.search = options.search;
          return this.stockService.getProductCatalog(search);
        })
      )
      .subscribe({
        next: (model) => {
          this.products = model.data;
          this.options = {
            ...this.options,
            count: model.count,
          };
          this.spinner.hide('stock-product-catalog-spinner');
        },
        error: (error) => {
          processError(error.error, 'Error cargando productos').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
          this.spinner.hide('stock-product-catalog-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }
}
