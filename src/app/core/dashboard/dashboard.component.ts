import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../general/service/dashboard.service';
import { RawInputVsOutputVsExistenceModel } from '../../general/model/raw-input-vs-output-vs-existence.model';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexXAxis,
} from 'ng-apexcharts';
import { ProductType } from '../models/product-type.enum';
import { ReasonEnum } from '../models/reason.enum';
import { processError } from '../utils/error.utils';
import { ToastService } from '../service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, of, Subscription, switchMap } from 'rxjs';
import { ClientModel } from '../../invoice/model/client.model';
import { RequiredPermissionType } from '../models/required-permission.type';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';

export type InputVsOutputVsExistenceType = {
  input: number;
  output: number;
  existence: number;
};

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'gpa-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  public monthlyChartOptions!: Partial<ChartOptions>;
  public inputOutputExistenceCartOptions!: any;
  clientsCount: number = 0;
  rawProductCount: number = 0;
  finishedProductCount: number = 0;
  revenues: number = 0.0;
  inputVsOutputVsExistence: InputVsOutputVsExistenceType = {
    input: 0,
    output: 0,
    existence: 0,
  };
  monthSeries: number[] = [];
  reason: ReasonEnum = ReasonEnum.Manufactured;
  refreshTransactionsPerMonth$ = new BehaviorSubject<{
    reason: number;
  }>({ reason: this.reason });
  refreshRevenue$ = new BehaviorSubject<number>(this.getCurrentMonth());
  isClientCatalogVisible: boolean = false;
  selectedClientes: { [index: string]: boolean } = {};
  selectedClientesData: {
    [index: string]: {
      name: string;
      latitude: number | null;
      longitude: number | null;
    };
  } = {};
  tempSelectedClientesData: {
    [index: string]: {
      name: string;
      latitude: number | null;
      longitude: number | null;
    };
  } = {};

  subscriptions$: Subscription[] = [];
  //permissions
  canRead: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit() {
    this.handlePermissionsLoad(() => {
      this.setMonthlyChartOptions([]);
      this.setInputOutputExistenceCartOptions(this.inputVsOutputVsExistence);
      this.loadTransactionPerMonth();
      this.loadClienteCount();
      this.loadRenueCount();
      this.loadInputVsOutputVsExistence();
    });
  }

  handlePermissionsLoad(onPermisionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.General][
            PermissionConstants.Components.Dashboard
          ]
      )
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
          onPermisionLoad();
        },
      });
    this.subscriptions$.push(sub);
  }

  setPermissions(requiredPermissions: RequiredPermissionType) {
    this.canRead = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Read
    );
  }

  loadInputVsOutputVsExistence() {
    this.spinner.show('fullscreen');
    const sub = this.dashboardService.getInputVsOutputVsExistence().subscribe({
      next: (data) => {
        this.processInputVsOutputVsExistence(data);
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        processError(
          error.error || error,
          'Error obteniendo las transacciones por mes'
        ).forEach((error) => {
          this.toastService.showError(error);
        });
        this.spinner.hide('fullscreen');
      },
    });
    this.subscriptions$.push(sub);
  }

  processInputVsOutputVsExistence(data: RawInputVsOutputVsExistenceModel[]) {
    let existence = 0;
    let input = 0;
    let output = 0;
    let rawMaterialExistence = 0;
    let finishedProductExistence = 0;

    data.forEach((element) => {
      if (element.productType === ProductType.RawProduct) {
        rawMaterialExistence += element.existence;
      } else {
        finishedProductExistence += element.existence;
      }
      input += element.input;
      output += element.output;
      existence += element.existence;
    });

    this.rawProductCount = rawMaterialExistence;
    this.finishedProductCount = finishedProductExistence;

    this.setInputOutputExistenceCartOptions({
      input: Math.abs(input),
      output: Math.abs(output),
      existence: Math.abs(existence),
    });
  }

  handleReasonChange(event: any) {
    if (event.target.value != -1) {
      this.reason = event.target.value;
      this.refreshTransactionsPerMonth$.next({
        reason: this.reason,
      });
    }
  }

  loadTransactionPerMonth() {
    const sub = this.refreshTransactionsPerMonth$
      .pipe(
        switchMap((value) => {
          this.spinner.show('transaction-spinner');
          if (value.reason != -1) {
            return this.dashboardService.getTransactionsPerMonthByReason(
              value.reason
            );
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: (data) => {
          let serie = data
            .sort((a, b) => a.month - b.month)
            .map((x) => x.quantity);
          this.setMonthlyChartOptions(serie);
          this.spinner.hide('transaction-spinner');
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error obteniendo las transacciones por mes'
          ).forEach((error) => {
            this.toastService.showError(error);
          });
          this.spinner.hide('transaction-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }

  loadClienteCount() {
    this.spinner.show('client-spinner');
    const sub = this.dashboardService.getClientsCount().subscribe({
      next: (data) => {
        this.clientsCount = data;
        this.spinner.hide('client-spinner');
      },
      error: (error) => {
        this.spinner.hide('client-spinner');
        processError(
          error.error || error,
          'Error obteniendo el conteo de clientes'
        ).forEach((error) => {
          this.toastService.showError(error);
        });
      },
    });
    this.subscriptions$.push(sub);
  }

  loadRenueCount() {
    const sub = this.refreshRevenue$
      .pipe(
        switchMap((month) => {
          this.spinner.show('revenue-spinner');
          return this.dashboardService.getSelesRevenue(month);
        })
      )
      .subscribe({
        next: (data) => {
          this.revenues = data;
          this.spinner.hide('revenue-spinner');
        },
        error: (error) => {
          this.spinner.hide('revenue-spinner');
          processError(
            error.error || error,
            'Error obteniendo el las ganancias por mes'
          ).forEach((error) => {
            this.toastService.showError(error);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  setMonthlyChartOptions(series: number[] = []) {
    this.monthlyChartOptions = {
      series: [
        {
          name: 'Transacciones por mes',
          data: [...series],
        },
      ],
      chart: {
        height: 290,
        type: 'bar',
      },
      title: {
        text: 'Transacciones mensuales del año en curso',
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
    };
  }

  setInputOutputExistenceCartOptions(data: InputVsOutputVsExistenceType) {
    this.inputOutputExistenceCartOptions = {
      chart: {
        height: 350,
        type: 'donut',
      },
      labels: ['Entrada', 'Salida', 'Existencia'],
      series: [data.input, data.output, data.existence],
      legend: {
        position: 'bottom',
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        width: 2,
        colors: ['#ffffff'],
      },
      colors: ['#435EEF', '#59a2fb', '#8ec0fd'],
      tooltip: {
        y: {
          formatter: function (val: string) {
            return '$' + val;
          },
        },
      },
    };
  }

  getCurrentMonth() {
    return new Date().getMonth() + 1;
  }

  handleMonthChange(event: any) {
    this.refreshRevenue$.next(event.target.value);
  }

  handleSelectedClient(client: ClientModel) {
    if (this.selectedClientes[client.id]) {
      delete this.selectedClientes[client.id];
      delete this.tempSelectedClientesData[client.id];
    } else {
      this.selectedClientes[client.id] = true;
      this.tempSelectedClientesData[client.id] = {
        name: client.name + ' ' + client.lastName,
        latitude: client.latitude,
        longitude: client.longitude,
      };
    }
  }

  showClientCatalog() {
    this.isClientCatalogVisible = true;
  }

  handleHideClientCatalog() {
    this.selectedClientesData = { ...this.tempSelectedClientesData };
  }
}
