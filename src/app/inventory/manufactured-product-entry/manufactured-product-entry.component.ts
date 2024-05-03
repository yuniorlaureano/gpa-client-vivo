import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { StockService } from '../service/stock.service';
import { RawProductCatalogModel } from '../models/raw-product-catalog.model';
import { ReasonModel } from '../models/reason.model';
import { ReasonService } from '../service/reason.service';
import { ProviderModel } from '../models/provider.model';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ReasonEnum } from '../../core/models/reason.enum';
import { TransactionType } from '../../core/models/transaction-type.enum';
import { InventoryEntryCollectionModel } from '../models/inventory-entry.model';

@Component({
  selector: 'gpa-manufactured-product-entry',
  templateUrl: './manufactured-product-entry.component.html',
  styleUrl: './manufactured-product-entry.component.css',
})
export class ManufacturedProductEntryComponent implements OnInit, OnDestroy {
  products: RawProductCatalogModel[] = [];
  isProductCatalogVisible: boolean = false;
  productCatalogAggregate: {
    totalPrice: number;
    totalQuantity: number;
  } = { totalPrice: 0, totalQuantity: 0 };

  reasons$!: Observable<ReasonModel[]>;

  stockForm = this.formBuilder.group({
    id: [''],
    description: [''],
    transactionType: [TransactionType.Input, Validators.required],
    providerId: [''],
    date: ['', Validators.required],
    storeId: [''],
    reasonId: ['', Validators.required],
    products: this.formBuilder.array([]),
  });

  constructor(
    private stockService: StockService,
    private reasonService: ReasonService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.reasons$ = this.reasonService
      .getReasons()
      .pipe(
        map((data) =>
          data.data.filter((reason) => reason.id != ReasonEnum.Sale)
        )
      );
  }

  ngOnDestroy(): void {}

  handleShowProductCatalog(visible: boolean) {
    this.isProductCatalogVisible = visible;
  }

  removeProductFromCatalog(index: number) {
    this.formProducts.removeAt(index);
    this.products = this.products.filter((item, i) => i != index);
    this.calculateSelectedProductCatalogAggregate();
  }

  calculateSelectedProductCatalogAggregate() {
    let totalPrice = 0;
    let totalQuantity = 0;
    for (let product of this.formProducts.value) {
      totalQuantity += product.quantity;
      totalPrice += product.quantity * product.price;
    }
    this.productCatalogAggregate = {
      totalPrice,
      totalQuantity,
    };
  }

  handleSelectedProductFromCatalog(product: RawProductCatalogModel) {
    if (!this.products.find((x) => x.productId == product.productId)) {
      this.products.push(product);
      this.formProducts?.push(this.newProduct(product));
      this.calculateSelectedProductCatalogAggregate();
    }
  }

  addProducts() {
    this.stockForm.markAsTouched();
    if (this.stockForm.valid) {
      const value = {
        ...this.stockForm.value,
        products: this.formProducts.value.map((product: any) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
      };
      console.log(value);
      //this.stockService.addProducts(<InventoryEntryCollectionModel>value);
    }
  }

  handleQuantityChange() {
    this.calculateSelectedProductCatalogAggregate();
  }

  get formProducts() {
    return this.stockForm.get('products') as FormArray;
  }

  handleSelectedProvider = (model: ProviderModel | null) => {
    this.stockForm.get('providerId')?.setValue(model?.id ?? null);
  };

  newProduct(product: RawProductCatalogModel) {
    return this.formBuilder.group({
      productCode: [product.productCode, Validators.required],
      price: [product.price, Validators.required],
      productName: [product.productName, Validators.required],
      productId: [product.productId, Validators.required],
      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(product.quantity),
        ],
      ],
    });
  }
}
