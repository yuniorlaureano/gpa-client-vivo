import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../service/product.service';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { ProductModel } from '../models/product.model';
import { SearchModel } from '../../core/models/search.model';
import { SearchOptionsModel } from '../../core/models/search-options.model';

@Component({
  selector: 'gpa-manufactured-product-entry',
  templateUrl: './manufactured-product-entry.component.html',
  styleUrl: './manufactured-product-entry.component.css',
})
export class ManufacturedProductEntryComponent implements OnInit, OnDestroy {
  isProductCatalogVisible: boolean = false;
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
    this.productSubscription.unsubscribe();
  }

  handleShowProductCatalog(visible: boolean) {
    this.isProductCatalogVisible = visible;
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

  handleSelectedProduct() {}

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
