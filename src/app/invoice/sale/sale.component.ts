import { Component, OnInit } from '@angular/core';
import { RawProductCatalogModel } from '../../inventory/models/raw-product-catalog.model';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ClientModel } from '../model/client.model';
import { SaleType } from '../../core/models/sale-type.enum';
import { InvoiceService } from '../service/invoice.service';
import { InvoiceModel } from '../model/invoice.model';

@Component({
  selector: 'gpa-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css',
})
export class SaleComponent implements OnInit {
  client: ClientModel | null = null;

  isProductCatalogVisible: boolean = false;
  isClientCatalogVisible: boolean = false;
  products: RawProductCatalogModel[] = [];
  productCatalogAggregate: {
    totalPrice: number;
    totalQuantity: number;
  } = { totalPrice: 0, totalQuantity: 0 };

  saleForm = this.formBuilder.group({
    id: [''],
    note: [null],
    status: ['', Validators.required],
    date: [null, Validators.required],
    expirationDate: [null, Validators.required],
    type: [SaleType.Cash, Validators.required],
    clientId: [''],
    storeId: [''],
    invoiceDetails: this.formBuilder.array([]),
  });

  constructor(
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService
  ) {}

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
    for (let product of this.invoiceDetails.value) {
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
      this.invoiceDetails?.push(this.newProduct(product));
      this.calculateSelectedProductCatalogAggregate();
    }
  }

  removeProductFromCatalog(index: number) {
    this.invoiceDetails.removeAt(index);
    this.products = this.products.filter((item, i) => i != index);
    this.calculateSelectedProductCatalogAggregate();
  }

  get invoiceDetails() {
    return this.saleForm.get('invoiceDetails') as FormArray;
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

  addSale() {
    this.saleForm.markAsTouched();
    if (this.saleForm.valid && this.invoiceDetails.length > 0) {
      const value = {
        ...this.saleForm.value,
        id: null,
        storeId: null,
        invoiceDetails: this.invoiceDetails.value.map((product: any) => ({
          productId: product.productId,
          quantity: product.quantity,
          price: product.price,
        })),
      };

      this.invoiceService.addInvoice(<InvoiceModel>value).subscribe({
        next: () => {
          this.clearForm();
        },
      });
    }
  }

  clearForm = () => {
    this.invoiceDetails.clear();
    this.products = [];
    this.saleForm.reset();
    this.client = null;
  };

  clearSelectedClient() {
    this.saleForm.get('clientId')?.setValue(null);
    this.client = null;
  }

  handleSelectedClient(client: ClientModel) {
    this.saleForm.get('clientId')?.setValue(client.id);
    this.client = client;
    this.isClientCatalogVisible = false;
  }
}
