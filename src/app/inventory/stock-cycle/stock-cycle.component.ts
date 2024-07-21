import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StockCycleService } from '../service/cycle.service';
import { StockCycleModel } from '../models/stock-cycle.model';
import { ToastService } from '../../core/service/toast.service';
import { Router } from '@angular/router';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-stock-cycle',
  templateUrl: './stock-cycle.component.html',
  styleUrl: './stock-cycle.component.css',
})
export class StockCycleComponent implements OnInit {
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
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {}

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
    this.stockCycleService.openStockCycle(value).subscribe({
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
  }
  handleCancel() {
    this.cycleForm.reset();
  }
}
