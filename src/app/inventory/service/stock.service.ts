import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { RawProductCatalogModel } from '../models/raw-product-catalog.model';
import { InventoryEntryModel } from '../models/inventory-entry.model';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  url = `${environment.api_url}/inventory/stocks`;
  constructor(private http: HttpClient) {}

  getProductCatalog(
    search: SearchModel | null = null
  ): Observable<ResponseModel<RawProductCatalogModel>> {
    return this.http.get<ResponseModel<RawProductCatalogModel>>(
      `${this.url}/products${search ? search.asQueryString() : ''}`
    );
  }

  addProducts(products: InventoryEntryModel[]): Observable<void> {
    return this.http.post<void>(`${this.url}/bulk`, products);
  }
}
