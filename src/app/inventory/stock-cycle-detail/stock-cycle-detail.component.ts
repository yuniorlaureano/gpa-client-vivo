import { Component, OnInit } from '@angular/core';
import { StockCycleService } from '../service/cycle.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import {
  StockCycleModel,
  StockCycleDetailModel,
} from '../models/stock-cycle.model';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { ToastService } from '../../core/service/toast.service';
import { CycleTypeEnum } from '../../core/models/cycle-type.enum';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-stock-cycle-detail',
  templateUrl: './stock-cycle-detail.component.html',
  styleUrl: './stock-cycle-detail.component.css',
})
export class StockCycleDetailComponent implements OnInit {
  stockCycle: {
    cycle: StockCycleModel;
    detail: {
      initial?: StockCycleDetailModel;
      final?: StockCycleDetailModel;
    }[];
  } | null = null;

  cycleId?: string | null = null;
  constructor(
    private stockCycleService: StockCycleService,
    private route: ActivatedRoute,
    private confirmService: ConfirmModalService,
    private toast: ToastService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCycle();
  }

  closeCycle() {
    this.close();
  }

  close() {
    this.confirmService
      .confirm('Ciclo', 'Está seguro de cerrar el ciclo de inventario ')
      .then(() => {
        this.spinner.show('fullscreen');
        this.stockCycleService.closeStockCycle(this.cycleId!).subscribe({
          next: () => {
            this.toast.showSucess('Cicle cerrado');
            this.loadCycle();
          },
          error: (error) => {
            this.spinner.show('fullscreen');
            this.toast.showError('Error al cerrar el ciclo de inventario');
          },
        });
      })
      .catch(() => {});
  }

  isClose() {
    return !this.stockCycle?.cycle?.isClose;
  }

  loadCycle() {
    this.route.paramMap
      .pipe(
        switchMap((route) => {
          this.spinner.show('fullscreen');
          const id = route.get('id');
          if (id) {
            return this.stockCycleService.getStockCycleById(id);
          }
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.stockCycle = {
              cycle: {
                ...data,
              },
              detail: this.transformCycleDetail(data.stockCycleDetails),
            };
            this.cycleId = data?.id;
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toast.showError('Error al cargar el ciclo de inventario');
        },
      });
  }

  transformCycleDetail(details: StockCycleDetailModel[] | null) {
    const cycleData: {
      [id: string]: {
        initial?: StockCycleDetailModel;
        final?: StockCycleDetailModel;
      };
    } = {};

    if (details) {
      for (let detail of details) {
        if (!cycleData[detail.productId]) {
          cycleData[detail.productId] = {};
        }
        if (detail.type == CycleTypeEnum.Initial) {
          cycleData[detail.productId]['initial'] = {
            ...detail,
          };
        }

        if (detail.type == CycleTypeEnum.Final) {
          cycleData[detail.productId]['final'] = {
            ...detail,
          };
        }
      }
      let transformedDetails: {
        initial?: StockCycleDetailModel;
        final?: StockCycleDetailModel;
      }[] = Object.keys(cycleData).map((d) => cycleData[d]);

      return transformedDetails;
    }

    return [];
  }
}
