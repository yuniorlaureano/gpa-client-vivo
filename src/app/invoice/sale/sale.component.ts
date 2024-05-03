import { Component, OnInit } from '@angular/core';
import { RawProductCatalogModel } from '../../inventory/models/raw-product-catalog.model';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { TransactionType } from '../../core/models/transaction-type.enum';
import { ReasonEnum } from '../../core/models/reason.enum';

@Component({
  selector: 'gpa-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css',
})
export class SaleComponent implements OnInit {
  isProductCatalogVisible: boolean = false;
  isClientCatalogVisible: boolean = false;
  products: RawProductCatalogModel[] = [];
  productCatalogAggregate: {
    totalPrice: number;
    totalQuantity: number;
  } = { totalPrice: 0, totalQuantity: 0 };

  saleForm = this.formBuilder.group({
    id: [''],
    description: [''],
    transactionType: [TransactionType.Output, Validators.required],
    date: ['', Validators.required],
    saleType: ['', Validators.required],
    storeId: [''],
    reasonId: [ReasonEnum.Sale, Validators.required],
    products: this.formBuilder.array([]),
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {}

  handleShowProductCatalog(visible: boolean) {
    this.isProductCatalogVisible = visible;
  }

  handleShowClientCatalog(visible: boolean) {
    this.isClientCatalogVisible = visible;
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

  removeProductFromCatalog(index: number) {
    this.formProducts.removeAt(index);
    this.products = this.products.filter((item, i) => i != index);
    this.calculateSelectedProductCatalogAggregate();
  }

  get formProducts() {
    return this.saleForm.get('products') as FormArray;
  }

  handleQuantityChange() {
    this.calculateSelectedProductCatalogAggregate();
  }

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
