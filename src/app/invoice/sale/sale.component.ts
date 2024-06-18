import { Component, OnInit } from '@angular/core';
import { ProductCatalogModel } from '../../inventory/models/product-catalog.model';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ClientModel } from '../model/client.model';
import { SaleType } from '../../core/models/sale-type.enum';
import { InvoiceService } from '../service/invoice.service';
import { InvoiceModel, InvoiceDetailModel } from '../model/invoice.model';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { ToastService } from '../../core/service/toast.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';

@Component({
  selector: 'gpa-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css',
})
export class SaleComponent implements OnInit {
  payment: number = 0;
  disableForm: boolean = false;
  saleType: SaleType = SaleType.Cash;
  client: ClientModel | null = null;
  isProductCatalogVisible: boolean = false;
  isClientCatalogVisible: boolean = false;
  selectedProducts: { [key: string]: ProductCatalogModel } = {};
  productCatalogAggregate: {
    totalPrice: number;
    totalQuantity: number;
    return: number;
  } = { totalPrice: 0, totalQuantity: 0, return: 0 };

  saleForm = this.formBuilder.group({
    id: [''],
    note: [null],
    status: [InvoiceStatusEnum.Saved, Validators.required],
    date: [null, Validators.required],
    type: [SaleType.Cash, Validators.required],
    clientId: ['', Validators.required],
    storeId: [''],
    invoiceDetails: this.formBuilder.array([]),
  });

  isEdit = false;

  constructor(
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmModalService
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
      return: 0,
    };
    if (!this.isEdit) {
      this.payment = totalPrice;
    }
  }

  handleSelectedProductFromCatalog(product: ProductCatalogModel) {
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

  getStatusDescription() {
    const status = this.saleForm.get('status')?.value;

    switch (status) {
      case InvoiceStatusEnum.Saved:
        return 'Guardado';
      case InvoiceStatusEnum.Draft:
        return 'Borrador';
      case InvoiceStatusEnum.Canceled:
        return 'Cancelado';
      default:
        return '';
    }
  }

  newProduct(product: ProductCatalogModel) {
    return this.formBuilder.group({
      productCode: [product.productCode, Validators.required],
      price: [product.price, Validators.required],
      productName: [product.productName, Validators.required],
      productId: [product.productId, Validators.required],
      quantity: [
        1,
        [Validators.required, Validators.min(1), Validators.max(product.stock)],
      ],
    });
  }

  save() {
    this.confirmService
      .confirm('Venta', 'Está seguro de realizar la venta?')
      .then(() => {
        this.saleForm.get('status')?.setValue(InvoiceStatusEnum.Saved);
        this.addSale();
      })
      .catch(() => {});
  }

  saveAsDraft() {
    this.saleForm.get('status')?.setValue(InvoiceStatusEnum.Draft);
    this.addSale();
  }

  addSale() {
    this.saleForm.markAsTouched();
    this.invoiceDetails.markAllAsTouched();
    if (this.saleForm.valid && this.invoiceDetails.length > 0) {
      const value = {
        ...this.saleForm.value,
        storeId: null,
        client: null,
        type: this.saleType,
        payment: this.payment,
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
            this.toastService.showSucess('Venta editada');
          },
          error: (err) =>
            this.toastService.showError('Error editando venta. ' + err),
        });
      } else {
        value.id = null;
        this.invoiceService.addInvoice(<InvoiceModel>value).subscribe({
          next: () => {
            this.clearForm();
            this.toastService.showSucess('Venta creada');
          },
          error: (err) =>
            this.toastService.showError('Error creando venta. ' + err),
        });
      }
    }
  }

  handleCancelInvoice() {
    this.confirmService
      .confirm('Devolver factura', 'Está seguro de devolver la factura?')
      .then(() => {
        this.cancelInvoice();
      })
      .catch(() => {});
  }

  cancelInvoice() {
    const id = this.saleForm.get('id')?.value;
    this.invoiceService.cancelInvoice(id!).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Devolución realizada');
      },
      error: (err) =>
        this.toastService.showError('Realizando devolución. ' + err),
    });
  }

  handlePayment(event: any) {
    this.payment = Number(event.target.value);
    if (this.payment < this.productCatalogAggregate.totalPrice) {
      this.saleType = SaleType.Credit;
    } else {
      this.saleType = SaleType.Cash;
      this.productCatalogAggregate.return =
        this.payment - this.productCatalogAggregate.totalPrice;
    }
  }

  clearForm = () => {
    this.isEdit = false;
    this.invoiceDetails.clear();
    this.selectedProducts = {};
    this.saleForm.reset({
      type: SaleType.Cash,
      status: InvoiceStatusEnum.Saved,
    });
    this.client = null;
    this.payment = 0;
    this.setDisable(false);
    this.router.navigate(['/invoice/sale']);
  };

  isDraft() {
    return this.saleForm.get('status')?.value == InvoiceStatusEnum.Draft;
  }

  showReturn() {
    return (
      this.isEdit &&
      this.saleForm.get('status')?.value == InvoiceStatusEnum.Saved
    );
  }

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
            type: invoice.type,
            clientId: invoice.clientId,
            storeId: null,
            invoiceDetails: [],
          });
          this.payment = invoice.payment;
          this.saleType = invoice.type;
          this.client = invoice.client;
          this.mapProductsToForm(invoice.invoiceDetails);
          this.calculateSelectedProductCatalogAggregate();
          this.setDisable(invoice.status == InvoiceStatusEnum.Canceled);
        }
      });
  }

  setDisable(disable: boolean) {
    console.log(disable);
    if (disable) {
      this.disableForm = true;
      this.saleForm.disable();
    } else {
      this.disableForm = false;
      this.saleForm.enable();
    }
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
                Validators.max(product.stockProduct.stock),
              ],
            ],
          })
        );
      }
    }
  }
}
