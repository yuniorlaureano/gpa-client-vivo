import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { FilterModel } from '../models/filter.model';
import { SearchOptionsModel } from '../models/search-options.model';
import { StockService } from '../../inventory/service/stock.service';
import { ProductCatalogModel } from '../../inventory/models/product-catalog.model';
import { ToastService } from '../service/toast.service';

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
  productSubscription!: Subscription;
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
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
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

  handleSelectedProductFromCatalog(product: ProductCatalogModel) {
    this.onSelectedProduct.emit(product);
  }

  loadProducts() {
    const search = new FilterModel();
    this.productSubscription = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          search.page = options.page;
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
        },
        error: (error) => {
          this.toastService.showError('Error cargando productos');
        },
      });
  }
}
