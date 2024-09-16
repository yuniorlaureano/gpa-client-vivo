import { Component, OnDestroy, OnInit } from '@angular/core';
import { StockCycleService } from '../service/cycle.service';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import {
  StockCycleModel,
  StockCycleDetailModel,
} from '../models/stock-cycle.model';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { ToastService } from '../../core/service/toast.service';
import { CycleTypeEnum } from '../../core/models/cycle-type.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { processError } from '../../core/utils/error.utils';
import { ReportService } from '../../report/service/report.service';
import { downloadFile } from '../../core/utils/file.utils';

@Component({
  selector: 'gpa-stock-cycle-detail',
  templateUrl: './stock-cycle-detail.component.html',
  styleUrl: './stock-cycle-detail.component.css',
})
export class StockCycleDetailComponent implements OnInit, OnDestroy {
  stockCycle: {
    cycle: StockCycleModel;
    detail: {
      initial?: StockCycleDetailModel;
      final?: StockCycleDetailModel;
    }[];
  } | null = null;

  cycleId?: string | null = null;

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canClose: boolean = false;

  constructor(
    private stockCycleService: StockCycleService,
    private route: ActivatedRoute,
    private confirmService: ConfirmModalService,
    private toast: ToastService,
    private spinner: NgxSpinnerService,
    private store: Store,
    private reportService: ReportService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadCycle();
    });
  }

  displayDate(date: any) {
    return date ? `${date.day}/${date.month}/${date.year}` : '';
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
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
    this.canClose = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Close
    );
  }

  closeCycle() {
    this.close();
  }

  close() {
    this.confirmService
      .confirm('Ciclo', 'Está seguro de cerrar el ciclo de inventario ')
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.stockCycleService
          .closeStockCycle(this.cycleId!)
          .subscribe({
            next: () => {
              this.toast.showSucess('Cicle cerrado');
              this.loadCycle();
            },
            error: (error) => {
              this.spinner.show('fullscreen');
              processError(
                error.error || error,
                'Error cerrando ciclo de inventario'
              ).forEach((err) => {
                this.toast.showError(err);
              });
            },
          });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }

  isClose() {
    return !this.stockCycle?.cycle?.isClose;
  }

  loadCycle() {
    const sub = this.route.paramMap
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
          this.mapStockCycle(data);
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error cargando el cliclo de inventario'
          ).forEach((err) => {
            this.toast.showError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  mapStockCycle(data: StockCycleModel | null) {
    if (data) {
      this.stockCycle = {
        cycle: {
          ...data,
        },
        detail: this.transformCycleDetail(data.stockCycleDetails),
      };
      this.cycleId = data?.id;
    }
  }

  downloadStocyCycleDetailsReport() {
    if (this.stockCycle?.cycle.id) {
      this.spinner.show('fullscreen');
      const sub = this.reportService
        .stockCycleReport(this.stockCycle?.cycle.id)
        .subscribe({
          next: (data) => {
            downloadFile(data, 'stock-cycle-details.pdf');
            this.spinner.hide('fullscreen');
          },
          error: () => {
            this.spinner.hide('fullscreen');
          },
        });
      this.subscriptions$.push(sub);
    }
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
