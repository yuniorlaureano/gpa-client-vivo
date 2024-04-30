import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  map,
  Observable,
  Subscription,
  switchMap,
} from 'rxjs';
import { SearchModel } from '../../core/models/search.model';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { StockService } from '../service/stock.service';
import { RawProductCatalogModel } from '../models/raw-product-catalog.model';
import { ReasonModel } from '../models/reason.model';
import { ReasonService } from '../service/reason.service';
import { ProviderModel } from '../models/provider.model';

@Component({
  selector: 'gpa-manufactured-product-entry',
  templateUrl: './manufactured-product-entry.component.html',
  styleUrl: './manufactured-product-entry.component.css',
})
export class ManufacturedProductEntryComponent implements OnInit, OnDestroy {
  products: RawProductCatalogModel[] = [];
  productPriceAndQuantity: any = {};
  isProductCatalogVisible: boolean = false;
  productCatalogAggregate: {
    totalPrice: number;
    totalQuantity: number;
  } = { totalPrice: 0, totalQuantity: 0 };

  reasons$!: Observable<ReasonModel[]>;

  constructor(
    private stockService: StockService,
    private reasonService: ReasonService
  ) {}

  ngOnInit(): void {
    this.reasons$ = this.reasonService
      .getReasons()
      .pipe(map((data) => data.data));
  }

  ngOnDestroy(): void {}

  handleShowProductCatalog(visible: boolean) {
    this.isProductCatalogVisible = visible;
  }

  removeProductFromCatalog(productId: string) {
    this.products = this.products.filter((x) => x.productId != productId);
    this.productPriceAndQuantity[productId] = { quantity: 0 };

    this.calculateSelectedProductCatalogAggregate();
  }

  calculateSelectedProductCatalogAggregate() {
    let totalPrice = 0;
    let totalQuantity = 0;
    for (let product of this.products) {
      totalQuantity += this.productPriceAndQuantity[product.productId].quantity;
      totalPrice +=
        this.productPriceAndQuantity[product.productId].quantity *
        product.price;
    }
    this.productCatalogAggregate = {
      totalPrice: totalPrice,
      totalQuantity: totalQuantity,
    };
  }

  handleQuantityChange(productId: string, event: any) {
    let product = this.products.find((x) => x.productId == productId);
    if (product) {
      this.productPriceAndQuantity[product.productId] = {
        quantity: Number(event.value),
      };
      this.calculateSelectedProductCatalogAggregate();
    }
  }

  handleSelectedProductFromCatalog(product: RawProductCatalogModel) {
    if (!this.products.find((x) => x.productId == product.productId)) {
      this.productPriceAndQuantity[product.productId] = { quantity: 1 };
      this.products = [...this.products, product];
      this.calculateSelectedProductCatalogAggregate();
    }
  }

  handleSelectedClient = (model: ProviderModel) => {
    console.log(model);
  };
}
