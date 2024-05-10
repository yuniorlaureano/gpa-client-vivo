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
import { ProductService } from '../../inventory/service/product.service';
import { ProductModel } from '../../inventory/models/product.model';

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
  });
  products!: ProductModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
  };

  constructor(private productService: ProductService) {}

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

  handleSelectedProductFromCatalog(product: ProductModel) {
    this.onSelectedProduct.emit(product);
  }

  loadProducts() {
    const search = new SearchModel();
    this.productSubscription = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          search.page = options.page;
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
      });
  }
}
