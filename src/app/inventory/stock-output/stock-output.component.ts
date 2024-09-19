import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, of, Subscription, switchMap } from 'rxjs';
import { StockService } from '../service/stock.service';
import { ReasonModel } from '../models/reason.model';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ReasonEnum } from '../../core/models/reason.enum';
import { TransactionType } from '../../core/models/transaction-type.enum';
import { InventoryOutputCollectionModel } from '../models/inventory-entry.model';
import { ActivatedRoute, Router } from '@angular/router';
import { StockDetailsModel, StockModel } from '../models/stock.model';
import { ProductModel } from '../models/product.model';
import { StockStatusEnum } from '../../core/models/stock-status.enum';
import { ToastService } from '../../core/service/toast.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';
import { AppState } from '../../core/ng-xs-store/states/app.state';

@Component({
  selector: 'gpa-stock-output',
  templateUrl: './stock-output.component.html',
  styleUrl: './stock-output.component.css',
})
export class StockOutputComponent implements OnInit, OnDestroy {
  isEdit = false;
  isFormDisabled: boolean = false;
  selectedProducts: { [key: string]: boolean } = {};
  isProductCatalogVisible: boolean = false;
  productCatalogAggregate: {
    totalQuantity: number;
  } = { totalQuantity: 0 };

  reasons$!: Observable<ReasonModel[]>;

  stockForm = this.formBuilder.group({
    id: [''],
    description: [''],
    transactionType: [TransactionType.Output, Validators.required],
    status: [StockStatusEnum.Saved],
    storeId: [''],
    reasonId: ['', Validators.required],
    stockDetails: this.formBuilder.array([]),
  });

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canRegisterOutput: boolean = false;
  canUpdateOutput: boolean = false;

  constructor(
    private stockService: StockService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private store: Store,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadReasons();
      this.getStock();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Inventory][
            PermissionConstants.Components.Stock
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
    this.canRegisterOutput = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.RegisterOutput
    );
    this.canUpdateOutput = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.UpdateOutput
    );
    this.canRead = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Read
    );
  }

  handleShowProductCatalog(visible: boolean) {
    this.isProductCatalogVisible = visible;
  }

  removeProductFromCatalog(index: number, productId: string) {
    this.formProducts.removeAt(index);
    delete this.selectedProducts[productId];
    this.calculateSelectedProductCatalogAggregate();
  }

  calculateSelectedProductCatalogAggregate() {
    let totalQuantity = 0;
    for (let product of this.formProducts.value) {
      totalQuantity += product.quantity;
    }
    this.productCatalogAggregate = {
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
        storeId: null,
        stockDetails: this.formProducts.value.map((product: any) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
      };

      if (this.isEdit) {
        this.updateOutput(value);
      } else {
        this.createOutput(value);
      }
    }
  }

  createOutput(value: any) {
    this.spinner.show('fullscreen');
    value.id = null;
    const sub = this.stockService
      .registerOutput(<InventoryOutputCollectionModel>value)
      .subscribe({
        next: () => {
          this.clearForm();
          this.toastService.showSucess('Registro agregado.');
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error || error, 'Error creando salida').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  updateOutput(value: any) {
    this.spinner.show('fullscreen');
    const sub = this.stockService
      .updateOutput(<InventoryOutputCollectionModel>value)
      .subscribe({
        next: () => {
          this.clearForm();
          this.toastService.showSucess('Registro modificado.');
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error modificando salida'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  save() {
    this.confirmService
      .confirm('Salida', 'Está seguro de guardar la salida?')
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
      .confirm('Cancelar salida', 'Está seguro de cancelar la salida?')
      .then(() => {
        this.cancelStock();
      })
      .catch(() => {});
  }

  cancelStock() {
    const id = this.stockForm.get('id')?.value;
    if (this.isEdit && id) {
      this.spinner.show('fullscreen');
      const sub = this.stockService.cancelStock(id).subscribe({
        next: () => {
          this.toastService.showSucess('Registro cancelado');
          this.clearForm();
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error || error, 'Error cancelando salida').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
        },
      });
      this.subscriptions$.push(sub);
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

  newProduct(product: ProductModel) {
    return this.formBuilder.group({
      id: [product.id],
      productCode: [product.code, Validators.required],
      productName: [product.name, Validators.required],
      productId: [product.id, Validators.required],
      quantity: [
        1,
        [Validators.required, Validators.min(1), Validators.max(2147483647)],
      ],
    });
  }

  getStock() {
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
          return this.stockService.getStockById(id);
        })
      )
      .subscribe({
        next: (stock) => {
          this.mapValues(stock);
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error || error, 'Error cargando salida').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  mapValues(stock: StockModel | null) {
    if (stock) {
      this.stockForm.setValue({
        id: stock.id,
        description: stock.description,
        transactionType: <TransactionType>stock.transactionType,
        status: stock.status,
        storeId: stock.storeId,
        reasonId: stock.reasonId.toString(),
        stockDetails: [],
      });
      this.mapStockToForm(stock.stockDetails);
      this.calculateSelectedProductCatalogAggregate();

      var notAValidReason =
        Number(stock.reasonId) != ReasonEnum.DamagedProduct &&
        Number(stock.reasonId) != ReasonEnum.ExpiredProduct &&
        Number(stock.reasonId) != ReasonEnum.RawMaterial;
      this.disableForm(
        stock.transactionType == TransactionType.Input ||
          notAValidReason ||
          stock.status == StockStatusEnum.Saved ||
          stock.status == StockStatusEnum.Canceled
      );
    }
  }

  clearForm = () => {
    this.formProducts.clear();
    this.selectedProducts = {};
    this.stockForm.reset({
      status: StockStatusEnum.Saved,
      transactionType: TransactionType.Output,
    });
    this.isEdit = false;
    this.disableForm(false);
    this.router.navigate(['/inventory/output']);
  };

  mapStockToForm(stockDetails: StockDetailsModel[]) {
    for (let stockDetail of stockDetails) {
      this.selectedProducts[stockDetail.product.id!] = true;
      this.formProducts.push(
        this.formBuilder.group({
          productCode: [stockDetail.product.code, Validators.required],
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

  disableForm(disable: boolean) {
    if (disable) {
      this.stockForm.disable();
      this.isFormDisabled = true;
    } else {
      this.stockForm.enable();
      this.isFormDisabled = false;
    }
  }

  loadReasons() {
    this.reasons$ = this.store
      .select(AppState.getReasons)
      .pipe(
        map((data) =>
          data.filter(
            (reason) =>
              ![
                ReasonEnum.Purchase,
                ReasonEnum.Sale,
                ReasonEnum.Return,
                ReasonEnum.Manufactured,
                ReasonEnum.OutputCancellation,
              ].includes(reason.id)
          )
        )
      );
  }
}
