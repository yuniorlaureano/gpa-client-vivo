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
import { ProductService } from '../../inventory/service/product.service';
import { ProductModel } from '../../inventory/models/product.model';
import { getProductTypeDescription } from '../utils/product.util';
import { ProductType } from '../models/product-type.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../utils/error.utils';
import { ErrorService } from '../service/error.service';

@Component({
  selector: 'gpa-product-catalog',
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.css',
})
export class ProductCatalogComponent implements OnInit, OnDestroy {
  @Input() selectedProducts: { [key: string]: boolean } = {};
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelectedProduct = new EventEmitter<ProductModel>();
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  products!: ProductModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  };
  searchTerms = new Subject<string>();
  subscriptions$: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private errorService: ErrorService,
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
  productType = (type: ProductType) => getProductTypeDescription(type);

  handleSelectedProductFromCatalog(product: ProductModel) {
    this.onSelectedProduct.emit(product);
  }

  handleSearch(event: any) {
    this.spinner.show('product-catalog-spinner');
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
          this.spinner.show('product-catalog-spinner');
          search.page = options.page;
          search.search = options.search;
          return this.productService.getProducts(search);
        })
      )
      .subscribe({
        next: (model) => {
          this.products = model.data;
          this.options = {
            ...this.options,
            count: model.count,
          };
          this.spinner.hide('product-catalog-spinner');
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error cargando productos'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
          this.spinner.hide('product-catalog-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }
}
