import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { RawProductCatalogModel } from '../models/raw-product-catalog.model';
import { InventoryEntryCollectionModel } from '../models/inventory-entry.model';
import { StockModel } from '../models/stock.model';

@Injectable()
export class StockService {
  url = `${environment.api_url}/inventory/stocks`;
  constructor(private http: HttpClient) {}

  getStockMaster(
    search: SearchModel | null = null
  ): Observable<ResponseModel<StockModel>> {
    return this.http.get<ResponseModel<StockModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getStockById(id: string): Observable<StockModel> {
    return this.http.get<StockModel>(`${this.url}/${id}`);
  }

  getProductCatalog(
    search: SearchModel | null = null
  ): Observable<ResponseModel<RawProductCatalogModel>> {
    return this.http.get<ResponseModel<RawProductCatalogModel>>(
      `${this.url}/products${search ? search.asQueryString() : ''}`
    );
  }

  addProducts(products: InventoryEntryCollectionModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, products);
  }
}
