import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { StockCycleModel } from '../models/stock-cycle.model';

@Injectable()
export class StockCycleService {
  url = `${environment.api_url}/inventory/stockcycles`;
  constructor(private http: HttpClient) {}

  getStockCycle(
    search: SearchModel | null = null
  ): Observable<ResponseModel<StockCycleModel>> {
    return this.http.get<ResponseModel<StockCycleModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getStockCycleById(id: string): Observable<StockCycleModel> {
    return this.http.get<StockCycleModel>(`${this.url}/${id}`);
  }

  openStockCycle(model: StockCycleModel): Observable<void> {
    return this.http.post<void>(`${this.url}/open`, model);
  }

  updateStockCycle(model: StockCycleModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }
}
