import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StockCycleService } from '../service/cycle.service';
import { StockCycleModel } from '../models/stock-cycle.model';
import { ToastService } from '../../core/service/toast.service';
import { Router } from '@angular/router';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { RequiredPermissionType } from '../../core/models/required-permission.type';

@Component({
  selector: 'gpa-stock-cycle',
  templateUrl: './stock-cycle.component.html',
  styleUrl: './stock-cycle.component.css',
})
export class StockCycleComponent implements OnInit, OnDestroy {
  cycleForm = this.form.group({
    note: ['', Validators.required],
    startDate: [null, Validators.required],
    endDate: [null, Validators.required],
    isClose: [false],
  });
  constructor(
    private form: FormBuilder,
    private stockCycleService: StockCycleService,
    private toast: ToastService,
    private router: Router,
    private confirmService: ConfirmModalService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad();
  }

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Inventory][
            PermissionConstants.Components.StockCycle
          ]
      )
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
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
  }

  onSubmit() {
    this.cycleForm.markAllAsTouched();
    const value = {
      id: null,
      ...this.cycleForm.value,
      isClose: false,
    };

    if (!this.cycleForm.valid) {
      return;
    }

    this.confirmService
      .confirm('Ciclo', 'Está seguro de abrir el ciclo de inventario ')
      .then(() => {
        this.save(<StockCycleModel>value);
      })
      .catch(() => {});
  }

  save(value: StockCycleModel) {
    this.spinner.show('fullscreen');
    const sub = this.stockCycleService.openStockCycle(value).subscribe({
      next: (stockCycleId) => {
        this.toast.showSucess('Cicle abierto');
        this.toast.showStandard('Redireccionando al detalle del ciclo');
        this.router.navigate([
          'inventory/stock/cycle/' + stockCycleId + '/detail',
        ]);
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        this.toast.showError('Error al abrir el ciclo de inventario');
      },
    });
    this.subscriptions$.push(sub);
  }
  handleCancel() {
    this.cycleForm.reset();
  }
}
