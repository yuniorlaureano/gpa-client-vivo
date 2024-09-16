import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ProductCatalogModel } from '../../inventory/models/product-catalog.model';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ClientModel } from '../model/client.model';
import { SaleType } from '../../core/models/sale-type.enum';
import { InvoiceService } from '../service/invoice.service';
import { InvoiceModel, InvoiceDetailModel } from '../model/invoice.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Subscription, switchMap } from 'rxjs';
import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { ToastService } from '../../core/service/toast.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import {
  calculateAddonPerConcept,
  conceptObjectToFlatArray,
} from '../../core/utils/product.util';
import { ClientService } from '../service/client.service';
import { getTotalClientFees } from '../../core/utils/client.utils';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { bankRound } from '../../core/utils/calculation.utils';
import { downloadFile } from '../../core/utils/file.utils';
import { InvoiceAttachModel } from '../model/invoice-attachment';
import { PaymentStatusEnum } from '../../core/models/payment-status.enum';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css',
})
export class SaleComponent implements OnInit, OnDestroy {
  paymentStatus: PaymentStatusEnum = PaymentStatusEnum.Pending;
  payment: number = 0;
  paymentValue: number = 0;
  disableForm: boolean = false;
  saleType: SaleType = SaleType.Cash;
  client: ClientModel | null = null;
  clientFees: { credit: number; debit: number } = { credit: 0, debit: 0 };
  isProductCatalogVisible: boolean = false;
  isClientCatalogVisible: boolean = false;
  selectedProducts: { [key: string]: ProductCatalogModel } = {};
  concepts: { concept: string; total: number; isDiscount: boolean }[] = [];
  files: FileList | null = null;
  productCatalogAggregate: {
    grossTotalPrice: number;
    netTotalPrice: number;
    totalQuantity: number;
    return: number;
    outOfCredit: boolean;
  } = {
    grossTotalPrice: 0,
    netTotalPrice: 0,
    totalQuantity: 0,
    return: 0,
    outOfCredit: false,
  };

  attachments: InvoiceAttachModel[] = [];
  attachmentsSubject$ = new BehaviorSubject<string | null>(null);
  @ViewChild('invoiceInputFile') invoiceFileInput!: ElementRef;

  saleForm = this.formBuilder.group({
    id: [''],
    note: [null],
    status: [InvoiceStatusEnum.Saved, Validators.required],
    type: [SaleType.Cash, Validators.required],
    date: [''],
    clientId: ['', Validators.required],
    storeId: [''],
    invoiceDetails: this.formBuilder.array([]),
  });

  isEdit = false;

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;
  canReturn: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmModalService,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.getInvoice();
      this.loadAttachments();
    });
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Invoice][
            PermissionConstants.Components.Invoicing
          ]
      )
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
          onPermissionLoad();
        },
      });
    this.subscriptions$.push(sub);
  }

  setPermissions(requiredPermissions: RequiredPermissionType) {
    this.canRead = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Read
    );
    this.canCreate = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Create
    );
    this.canDelete = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Delete
    );
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
    this.canReturn = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Return
    );
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
    let concepts: { [id: string]: { isDiscount: boolean; total: number } } = {};

    for (let product of this.invoiceDetails.value) {
      totalQuantity += product.quantity;
      totalPrice += product.quantity * product.price;
      calculateAddonPerConcept(
        product.price,
        product.quantity,
        this.selectedProducts[product.productCode].addons ?? [],
        concepts
      );
    }

    const flatConcepts = conceptObjectToFlatArray(concepts);
    this.concepts = flatConcepts.flatConcepts;

    this.productCatalogAggregate = {
      grossTotalPrice: bankRound(totalPrice),
      netTotalPrice: bankRound(
        totalPrice - flatConcepts.debit + flatConcepts.credit
      ),
      totalQuantity,
      return: 0,
      outOfCredit: false,
    };

    if (!this.isEdit) {
      this.payment = bankRound(
        totalPrice - flatConcepts.debit + flatConcepts.credit
      );
      this.paymentValue = bankRound(
        totalPrice - flatConcepts.debit + flatConcepts.credit
      );
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
        [
          Validators.required,
          Validators.min(1),
          // Validators.max(product.stock)
        ],
      ],
    });
  }

  save() {
    this.handlePayment({ target: { value: this.getPayment() } });
    if (this.productCatalogAggregate.outOfCredit) {
      this.toastService.showError('No tiene crédito suficiente. Verificar');
      return;
    }
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
      const value = this.getValue();
      if (this.isEdit) {
        this.updateInvoice(value);
      } else {
        this.addInvoice(value);
      }
    }
  }

  addInvoice(value: InvoiceModel) {
    this.spinner.show('fullscreen');
    value.id = null;
    const sub = this.invoiceService.addInvoice(<InvoiceModel>value).subscribe({
      next: (data) => {
        this.uploadFile(data.id!, (success) => {
          if (success) {
            this.toastService.showSucess('Adjuntos agregados');
          }
          this.toastService.showSucess('Venta realizada');
          // this.calculateSelectedProductCatalogAggregate();
          // this.spinner.hide('fullscreen');
          this.router.navigate(['/invoice/sale/edit/' + data.id]);
        });
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(error.error || error, 'Error realizando venta').forEach(
          (err) => {
            this.toastService.showError(err);
          }
        );
      },
    });
    this.subscriptions$.push(sub);
  }

  updateInvoice(value: InvoiceModel) {
    this.spinner.show('fullscreen');
    const sub = this.invoiceService.updateInvoice(value).subscribe({
      next: () => {
        this.router.navigate(['/invoice/sale/edit/' + value.id]);
        this.toastService.showSucess('Venta editada');
        this.calculateSelectedProductCatalogAggregate();
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(error.error || error, 'Error editando venta').forEach(
          (err) => {
            this.toastService.showError(err);
          }
        );
      },
    });
    this.subscriptions$.push(sub);
  }

  getValue() {
    return {
      ...this.saleForm.value,
      storeId: null,
      client: null,
      date: '',
      type: this.saleType,
      payment: this.getPayment(),
      paymentStatus: PaymentStatusEnum.Paid,
      invoiceDetails: this.invoiceDetails.value.map((product: any) => ({
        id: product.id,
        productId: product.productId,
        quantity: product.quantity,
        price: product.price,
      })),
    } as InvoiceModel;
  }

  getPayment() {
    return this.payment > this.productCatalogAggregate.netTotalPrice
      ? this.productCatalogAggregate.netTotalPrice
      : this.payment;
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
    this.spinner.hide('fullscreen');
    const id = this.saleForm.get('id')?.value;
    const sub = this.invoiceService.cancelInvoice(id!).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Devolución realizada');
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(
          error.error || error,
          'Error realizando devolución'
        ).forEach((err) => {
          this.toastService.showError(err);
        });
      },
    });
    this.subscriptions$.push(sub);
  }

  handlePayment(event: any) {
    this.payment = Number(event.target.value);
    if (this.payment < this.productCatalogAggregate.netTotalPrice) {
      this.saleType = SaleType.Credit;
      this.productCatalogAggregate.return = 0;
      this.setOutOfCredit();
    } else {
      this.setOutOfCredit();
      this.saleType = SaleType.Cash;
      this.productCatalogAggregate.return =
        this.payment - this.productCatalogAggregate.netTotalPrice;
    }
  }

  setOutOfCredit() {
    this.productCatalogAggregate.outOfCredit =
      this.productCatalogAggregate.netTotalPrice - this.payment >
      this.clientFees.credit;
  }

  handleNew() {
    this.clearForm();
    this.router.navigate(['/invoice/sale']);
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
    this.paymentValue = 0;
    this.setDisable(false);
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

  handleSelectedClient(client: ClientModel) {
    this.spinner.show('fullscreen');
    this.saleForm.get('clientId')?.setValue(client.id);
    this.isClientCatalogVisible = false;
    const sub = this.clientService.getClientById(client.id).subscribe({
      next: (data) => {
        this.client = data;
        this.clientFees = getTotalClientFees(data);
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        processError(error.error || error, 'Error cargando cliente').forEach(
          (err) => {
            this.toastService.showError(err);
          }
        );
        this.spinner.hide('fullscreen');
      },
    });
    this.subscriptions$.push(sub);
  }

  getInvoice() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id == null) {
            this.isEdit = false;
            return of(null);
          }
          this.isEdit = true;
          return this.invoiceService.getInvoice(id);
        })
      )
      .subscribe({
        next: (invoice) => {
          if (invoice) {
            this.saleForm.setValue({
              id: invoice.id,
              note: <any>invoice.note,
              status: invoice.status,
              date: invoice.date,
              type: invoice.type,
              clientId: invoice.clientId,
              storeId: null,
              invoiceDetails: [],
            });
            this.payment = invoice.payment;
            this.paymentValue = invoice.payment;
            this.saleType = invoice.type;
            this.client = invoice.client;
            this.clientFees = getTotalClientFees(invoice.client);
            this.mapProductsToForm(invoice.invoiceDetails);
            this.calculateSelectedProductCatalogAggregate();
            this.setDisable(invoice.status == InvoiceStatusEnum.Canceled);
            this.attachmentsSubject$.next(invoice.id);

            this.paymentStatus = invoice.paymentStatus;
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          processError(error.error || error, 'Error cargando factura').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
          this.spinner.hide('fullscreen');
        },
      });
    this.subscriptions$.push(sub);
  }

  isPaid() {
    return this.paymentStatus == PaymentStatusEnum.Paid;
  }

  setDisable(disable: boolean) {
    if (disable) {
      this.disableForm = true;
      this.saleForm.disable();
    } else {
      this.disableForm = false;
      this.saleForm.enable();
    }
  }

  processFileUpload(event: Event) {
    const fileElement = event.currentTarget as HTMLInputElement;
    this.files = fileElement.files;
    //automaticaly upload the file if the product is being edited
    this.uploadFIleOnUpdate();
  }

  uploadFIleOnUpdate() {
    if (this.isEdit && this.saleForm.get('id')?.value) {
      this.spinner.show('invoice-file-spinner');
      this.uploadFile(this.saleForm.get('id')?.value!, () => {
        this.toastService.showSucess('Adjuntos agregados');
        this.spinner.hide('invoice-file-spinner');
      });
    }
  }

  uploadFile(invoiceId: string, func: (success: boolean) => void) {
    if (this.files && this.files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < this.files.length; i++) {
        formData.append('files', this.files[i]);
      }
      const sub = this.invoiceService
        .uploadAttachment(invoiceId, formData)
        .subscribe({
          next: () => {
            func(true);
            this.invoiceFileInput.nativeElement.value = '';
            if (this.isEdit) {
              this.attachmentsSubject$.next(invoiceId);
            }
          },
          error: () => {
            func(false);
          },
        });
      this.subscriptions$.push(sub);
    } else {
      func(false);
    }
  }

  loadAttachments() {
    const sub = this.attachmentsSubject$
      .pipe(
        switchMap((invoiceId) => {
          this.spinner.show('invoice-file-spinner');
          if (invoiceId) {
            return this.invoiceService.getAttachments(invoiceId);
          }
          return of([]);
        })
      )
      .subscribe({
        next: (attachments) => {
          this.mapAttachments(attachments);
          this.spinner.hide('invoice-file-spinner');
        },
        error: () => {
          this.spinner.hide('invoice-file-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }

  mapAttachments(attachments: InvoiceAttachModel[]) {
    this.attachments = attachments.map((attachment) => {
      let file = JSON.parse(attachment.file);
      attachment.deserializedFile = {
        name: file.fileName,
        uniqueName: file.uniqueFileName,
      };
      return attachment;
    });
  }

  downloadAttachment(id: string, name: string) {
    this.spinner.show('invoice-file-spinner');
    const sub = this.invoiceService.downloadAttachments(id).subscribe({
      next: (data) => {
        downloadFile(data, name);
        this.spinner.hide('invoice-file-spinner');
      },
      error: () => {
        this.spinner.hide('invoice-file-spinner');
      },
    });
    this.subscriptions$.push(sub);
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
            price: [product.stockProduct.price, Validators.required],
            productName: [
              product.stockProduct.productName,
              Validators.required,
            ],
            productId: [product.stockProduct.productId, Validators.required],
            quantity: [
              product.quantity,
              [
                Validators.required,
                Validators.min(1),
                // Validators.max(product.stockProduct.stock),
              ],
            ],
          })
        );
      }
    }
  }

  printInvoice() {
    this.spinner.show('fullscreen');
    if (this.saleForm.get('id')?.value) {
      this.invoiceService
        .printInvoice(this.saleForm.get('id')?.value!)
        .subscribe({
          next: (pdfBlob: Blob) => {
            const url = window.URL.createObjectURL(pdfBlob);
            const printWindow = window.open(url);
            if (printWindow) {
              printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
              };
            }
            this.spinner.hide('fullscreen');
          },
          error: () => {
            this.spinner.hide('fullscreen');
          },
        });
    }
  }

  printProofOfPayment() {
    this.spinner.show('fullscreen');
    if (this.saleForm.get('id')?.value) {
      this.invoiceService
        .printProofOfPayment(this.saleForm.get('id')?.value!)
        .subscribe({
          next: (pdfBlob: Blob) => {
            const url = window.URL.createObjectURL(pdfBlob);
            const printWindow = window.open(url);
            if (printWindow) {
              printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
              };
            }
            this.spinner.hide('fullscreen');
          },
          error: () => {
            this.spinner.hide('fullscreen');
          },
        });
    }
  }
}
