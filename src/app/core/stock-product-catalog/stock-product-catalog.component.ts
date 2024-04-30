import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { SearchModel } from '../models/search.model';
import { SearchOptionsModel } from '../models/search-options.model';
import { StockService } from '../../inventory/service/stock.service';
import { RawProductCatalogModel } from '../../inventory/models/raw-product-catalog.model';

@Component({
  selector: 'gpa-stock-product-catalog',
  templateUrl: './stock-product-catalog.component.html',
  styleUrl: './stock-product-catalog.component.css',
})
export class StockProductCatalogComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelectedProduct = new EventEmitter<RawProductCatalogModel>();
  productSubscription!: Subscription;
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
  });
  products!: RawProductCatalogModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
  };

  constructor(private stockService: StockService) {}

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

  handleSelectedProductFromCatalog(product: RawProductCatalogModel) {
    this.onSelectedProduct.emit(product);
  }

  loadProducts() {
    const search = new SearchModel();
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
      });
  }
}
