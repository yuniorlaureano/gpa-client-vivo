import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent,
} from 'ng-apexcharts';

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
export class DashboardComponent {
  // @ViewChild('chart') chart!: ChartComponent;
  public monthlyChartOptions!: Partial<ChartOptions>;
  public inputOutputExistenceCartOptions!: any;

  constructor() {
    this.setMonthlyChartOptions();
    this.setInputOutputExistenceCartOptions();
  }

  setMonthlyChartOptions() {
    this.monthlyChartOptions = {
      series: [
        {
          name: 'My-series',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
      ],
      chart: {
        height: 290,
        type: 'bar',
      },
      title: {
        text: 'Transacciones mensuales',
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
        ],
      },
    };
  }

  setInputOutputExistenceCartOptions() {
    this.inputOutputExistenceCartOptions = {
      chart: {
        height: 350,
        type: 'donut',
      },
      labels: ['Entrada', 'Salida', 'Existencia'],
      series: [60000, 45000, 15000],
      legend: {
        position: 'bottom',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 8,
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
    // var chart = new ApexCharts(
    //   document.querySelector("#byDevice"),
    //   options
    // );
    // chart.render();
  }
}
