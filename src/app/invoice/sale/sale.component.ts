import { Component, OnInit } from '@angular/core';
import { RawProductCatalogModel } from '../../inventory/models/raw-product-catalog.model';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ClientModel } from '../model/client.model';
import { SaleType } from '../../core/models/sale-type.enum';
import { InvoiceService } from '../service/invoice.service';
import { InvoiceModel, InvoiceDetailModel } from '../model/invoice.model';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'gpa-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css',
})
export class SaleComponent implements OnInit {
  client: ClientModel | null = null;
  isProductCatalogVisible: boolean = false;
  isClientCatalogVisible: boolean = false;
  selectedProducts: { [key: string]: RawProductCatalogModel } = {};
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

  isEdit = false;

  constructor(
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getInvoice();
  }

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
    if (!this.selectedProducts[product.productCode]) {
      this.selectedProducts[product.productCode] = product;
      this.invoiceDetails?.push(this.newProduct(product));
      this.calculateSelectedProductCatalogAggregate();
    }
  }

  removeProductFromCatalog(index: number, productCode: string) {
    this.invoiceDetails.removeAt(index);
    delete this.selectedProducts[productCode];
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
    this.invoiceDetails.markAllAsTouched();
    console.log(this.invoiceDetails);
    if (this.saleForm.valid && this.invoiceDetails.length > 0) {
      const value = {
        ...this.saleForm.value,
        storeId: null,
        client: null,
        invoiceDetails: this.invoiceDetails.value.map((product: any) => ({
          id: product.id,
          productId: product.productId,
          quantity: product.quantity,
          price: product.price,
        })),
      };

      if (this.isEdit) {
        this.invoiceService.updateInvoice(<InvoiceModel>value).subscribe({
          next: () => {
            this.clearForm();
          },
        });
      } else {
        value.id = null;
        this.invoiceService.addInvoice(<InvoiceModel>value).subscribe({
          next: () => {
            this.clearForm();
          },
        });
      }
    }
  }

  clearForm = () => {
    this.isEdit = false;
    this.invoiceDetails.clear();
    this.selectedProducts = {};
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

  getInvoice() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id == null) {
            this.isEdit = false;
            return of(null);
          }
          this.isEdit = true;
          return this.invoiceService.getInvoice(id);
        })
      )
      .subscribe((invoice) => {
        if (invoice) {
          this.saleForm.setValue({
            id: invoice.id,
            note: <any>invoice.note,
            status: invoice.status,
            date: <any>invoice.date,
            expirationDate: <any>invoice.expirationDate,
            type: invoice.type,
            clientId: invoice.clientId,
            storeId: null,
            invoiceDetails: [],
          });
          this.client = invoice.client;
          this.mapProductsToForm(invoice.invoiceDetails);
        }
      });
  }

  mapProductsToForm(invoiceDetails: InvoiceDetailModel[]) {
    for (let product of invoiceDetails) {
      if (product.stockProduct) {
        this.selectedProducts[product.stockProduct.productCode] =
          product.stockProduct;
        this.invoiceDetails.push(
          this.formBuilder.group({
            productCode: [
              product.stockProduct.productCode,
              Validators.required,
            ],
            price: [product.price, Validators.required],
            productName: [
              product.stockProduct.productName,
              Validators.required,
            ],
            productId: [product.productId, Validators.required],
            quantity: [
              product.quantity,
              [
                Validators.required,
                Validators.min(1),
                Validators.max(product.stockProduct.quantity),
              ],
            ],
          })
        );
      }
    }
  }
}
