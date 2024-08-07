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
import { ToastService } from '../service/toast.service';

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
  productSubscription!: Subscription;
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
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initSearch();
  }

  ngOnDestroy(): void {
    this.handleShowProductCatalog(false);
    this.productSubscription.unsubscribe();
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
    this.productSubscription = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
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
        },
        error: (error) => {
          this.toastService.showError('Error cargando productos');
        },
      });
  }
}
