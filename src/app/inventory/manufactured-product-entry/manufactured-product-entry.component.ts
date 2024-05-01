import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { map, Observable } from 'rxjs';
import { StockService } from '../service/stock.service';
import { RawProductCatalogModel } from '../models/raw-product-catalog.model';
import { ReasonModel } from '../models/reason.model';
import { ReasonService } from '../service/reason.service';
import { ProviderModel } from '../models/provider.model';
import { FormArray, FormBuilder, NgForm, Validators } from '@angular/forms';

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

  stockForm = this.formBuilder.group({
    id: [''],
    // description: [''],
    transactionType: ['', Validators.required],
    providerId: [''],
    date: ['', Validators.required],
    // storeId: [''],
    reasonId: ['', Validators.required],
    products: this.formBuilder.array([
      this.formBuilder.group({
        productId: ['', Validators.required],
        quantity: ['', Validators.required],
      }),
    ]),
  });

  constructor(
    private stockService: StockService,
    private reasonService: ReasonService,
    private formBuilder: FormBuilder
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

  handleSelectedProvider = (model: ProviderModel) => {
    this.stockForm.get('providerId')?.setValue(model.id);
  };

  get formProducts() {
    return this.stockForm.get('products') as FormArray;
  }

  addProducts() {
    // this.formProducts.push(
    //   this.products.map((product) => {
    //     return {
    //       productId: product.productId,
    //       quantity: this.productPriceAndQuantity[product.productId],
    //     };
    //   })
    // );
    console.log(this.stockForm.value);
    //set the provider
    //set attachment, but for future
    //add the productos to the stock
  }
}
