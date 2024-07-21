import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { StockService } from '../service/stock.service';
import { ReasonModel } from '../models/reason.model';
import { ReasonService } from '../service/reason.service';
import { ProviderModel } from '../models/provider.model';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ReasonEnum } from '../../core/models/reason.enum';
import { TransactionType } from '../../core/models/transaction-type.enum';
import { InventoryEntryCollectionModel } from '../models/inventory-entry.model';
import { SelectModel } from '../../core/models/select-model';
import { ActivatedRoute, Router } from '@angular/router';
import { StockDetailsModel } from '../models/stock.model';
import { ProductModel } from '../models/product.model';
import { StockStatusEnum } from '../../core/models/stock-status.enum';
import { ToastService } from '../../core/service/toast.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-stock-entry',
  templateUrl: './stock-entry.component.html',
  styleUrl: './stock-entry.component.css',
})
export class StockEntryComponent implements OnInit, OnDestroy {
  isEdit = false;
  isFormDisabled: boolean = false;
  selectedProducts: { [key: string]: boolean } = {};
  isProductCatalogVisible: boolean = false;
  selectedProvider: SelectModel<ProviderModel> | null = null;
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
    status: [StockStatusEnum.Saved],
    date: ['', Validators.required],
    storeId: [''],
    reasonId: ['', Validators.required],
    stockDetails: this.formBuilder.array([]),
  });

  constructor(
    private stockService: StockService,
    private reasonService: ReasonService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.reasons$ = this.reasonService
      .getReasons()
      .pipe(
        map((data) =>
          data.data.filter(
            (reason) =>
              ![
                ReasonEnum.Sale,
                ReasonEnum.Return,
                ReasonEnum.DamagedProduct,
                ReasonEnum.ExpiredProduct,
                ReasonEnum.RawMaterial,
              ].includes(reason.id)
          )
        )
      );

    this.getStock();
  }

  ngOnDestroy(): void {}

  handleShowProductCatalog(visible: boolean) {
    this.isProductCatalogVisible = visible;
  }

  removeProductFromCatalog(index: number, productId: string) {
    this.formProducts.removeAt(index);
    delete this.selectedProducts[productId];
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

  handleSelectedProductFromCatalog(product: ProductModel) {
    if (!this.selectedProducts[product.id!]) {
      this.selectedProducts[product.id!] = true;
      this.formProducts?.push(this.newProduct(product));
      this.calculateSelectedProductCatalogAggregate();
    }
  }

  addProducts() {
    this.stockForm.markAsTouched();
    if (this.stockForm.valid && this.formProducts.length > 0) {
      const value = {
        ...this.stockForm.value,
        providerId:
          this.stockForm.value.providerId == ''
            ? null
            : this.stockForm.value.providerId,
        storeId: null,
        stockDetails: this.formProducts.value.map((product: any) => ({
          productId: product.productId,
          purchasePrice: product.purchasePrice,
          quantity: product.quantity,
        })),
      };

      if (this.isEdit) {
        this.spinner.show('fullscreen');
        this.stockService
          .updateInput(<InventoryEntryCollectionModel>value)
          .subscribe({
            next: () => {
              this.clearForm();
              this.toastService.showSucess('Registro modificado.');
              this.spinner.hide('fullscreen');
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              this.toastService.showError('Error modificando registro');
            },
          });
      } else {
        this.spinner.show('fullscreen');
        value.id = null;
        this.stockService
          .registerInput(<InventoryEntryCollectionModel>value)
          .subscribe({
            next: () => {
              this.clearForm();
              this.toastService.showSucess('Registro agregado.');
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              this.toastService.showError('Error agregando registro');
            },
          });
      }
    }
  }

  save() {
    this.confirmService
      .confirm('Entrada', 'Está seguro de guardar la entrada?')
      .then(() => {
        this.stockForm.get('status')?.setValue(StockStatusEnum.Saved);
        this.addProducts();
      })
      .catch(() => {});
  }

  saveDraft() {
    this.stockForm.get('status')?.setValue(StockStatusEnum.Draft);
    this.addProducts();
  }

  handleCancelStock() {
    this.confirmService
      .confirm('Cancelar entrada', 'Está seguro de cancelar la entrada?')
      .then(() => {
        this.cancelStock();
      })
      .catch(() => {});
  }

  cancelStock() {
    const id = this.stockForm.get('id')?.value;
    if (this.isEdit && id) {
      this.spinner.show('fullscreen');
      this.stockService.cancelStock(id).subscribe({
        next: () => {
          this.toastService.showSucess('Registro cancelado');
          this.clearForm();
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.toastService.showError('Error al cancelar el registro');
          this.spinner.hide('fullscreen');
        },
      });
    }
  }

  isDraft() {
    const status = this.stockForm.get('status')?.value;
    return status == StockStatusEnum.Draft;
  }

  showCancel() {
    const status = this.stockForm.get('status')?.value;
    const reason = Number(this.stockForm.get('reasonId')?.value);
    return (
      this.isEdit &&
      (status == StockStatusEnum.Saved || status == StockStatusEnum.Draft) &&
      ![ReasonEnum.Sale, ReasonEnum.Return].includes(reason)
    );
  }

  getStatusDescription() {
    const status = this.stockForm.get('status')?.value;

    switch (status) {
      case StockStatusEnum.Saved:
        return 'Guardado';
      case StockStatusEnum.Draft:
        return 'Borrador';
      case StockStatusEnum.Canceled:
        return 'Cancelado';
      default:
        return '';
    }
  }

  handleQuantityChange() {
    this.calculateSelectedProductCatalogAggregate();
  }

  get formProducts() {
    return this.stockForm.get('stockDetails') as FormArray;
  }

  handleSelectedProvider = (model: ProviderModel | null) => {
    if (model) {
      this.selectedProvider = {
        text: model.name + ' ' + model.rnc,
        value: model,
      };
      this.stockForm.get('providerId')?.setValue(model.id);
    } else {
      this.selectedProvider = null;
      this.stockForm.get('providerId')?.setValue(null);
    }
  };

  newProduct(product: ProductModel) {
    return this.formBuilder.group({
      id: [product.id],
      productCode: [product.code, Validators.required],
      price: [product.price, Validators.required],
      purchasePrice: [product.price, Validators.required],
      productName: [product.name, Validators.required],
      productId: [product.id, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  getStock() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id == null) {
            this.isEdit = false;
            return of(null);
          }
          this.isEdit = true;
          return this.stockService.getStockById(id);
        })
      )
      .subscribe({
        next: (stock) => {
          if (stock) {
            this.stockForm.setValue({
              id: stock.id,
              description: stock.description,
              transactionType: <TransactionType>stock.transactionType,
              status: stock.status,
              providerId: stock.providerId,
              date: stock.date,
              storeId: stock.storeId,
              reasonId: stock.reasonId.toString(),
              stockDetails: [],
            });
            this.mapStockToForm(stock.stockDetails);
            this.selectedProvider = stock.providerName
              ? {
                  text: stock.providerName + ' ' + stock.providerRnc,
                  value: {
                    id: stock.providerId,
                    name: stock.providerName,
                    rnc: stock.providerRnc,
                  },
                }
              : null;
            this.calculateSelectedProductCatalogAggregate();
            this.disableForm(
              stock.transactionType == TransactionType.Output ||
                Number(stock.reasonId) == ReasonEnum.Return ||
                stock.status == StockStatusEnum.Saved ||
                stock.status == StockStatusEnum.Canceled
            );
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al obtener la existencia');
        },
      });
  }

  clearForm = () => {
    this.formProducts.clear();
    this.selectedProducts = {};
    this.stockForm.reset({ status: StockStatusEnum.Saved });
    this.selectedProvider = null;
    this.isEdit = false;
    this.disableForm(false);
    this.router.navigate(['/inventory/entry']);
  };

  mapStockToForm(stockDetails: StockDetailsModel[]) {
    for (let stockDetail of stockDetails) {
      this.selectedProducts[stockDetail.product.id!] = true;
      this.formProducts.push(
        this.formBuilder.group({
          productCode: [stockDetail.product.code, Validators.required],
          price: [stockDetail.product.price, Validators.required],
          purchasePrice: [stockDetail.purchasePrice, Validators.required],
          productName: [stockDetail.product.name, Validators.required],
          productId: [stockDetail.productId, Validators.required],
          quantity: [
            stockDetail.quantity,
            [Validators.required, Validators.min(1)],
          ],
        })
      );
    }
  }

  computePrice(formProduct: any) {
    return (
      parseFloat(formProduct.get('quantity').value) *
      parseFloat(formProduct.get('price').value)
    );
  }

  disableForm(disable: boolean) {
    if (disable) {
      this.stockForm.disable();
      this.isFormDisabled = true;
    } else {
      this.stockForm.enable();
      this.isFormDisabled = false;
    }
  }
}
