import { Component, OnInit } from '@angular/core';
import { StockCycleService } from '../service/cycle.service';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { StockCycleModel } from '../models/stock-cycle.model';

@Component({
  selector: 'gpa-stock-cycle-detail',
  templateUrl: './stock-cycle-detail.component.html',
  styleUrl: './stock-cycle-detail.component.css',
})
export class StockCycleDetailComponent implements OnInit {
  stockCycle: StockCycleModel | null = null;

  constructor(
    private stockCycleService: StockCycleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCycle();
  }

  loadCycle() {
    this.route.paramMap
      .pipe(
        switchMap((route) => {
          const id = route.get('id');
          if (id) {
            return this.stockCycleService.getStockCycleById(id);
          }
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          this.stockCycle = data;
        },
      });
  }
}
