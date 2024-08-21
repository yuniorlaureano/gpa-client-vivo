import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { ProductCatalogModel } from '../models/product-catalog.model';
import {
  InventoryEntryCollectionModel,
  InventoryOutputCollectionModel,
} from '../models/inventory-entry.model';
import { StockModel } from '../models/stock.model';
import { ExistenceModel } from '../models/existence.model';
import { StockAttachModel } from '../models/stock-attachment';

@Injectable()
export class StockService {
  url = `${environment.api_url}/inventory/stocks`;
  constructor(private http: HttpClient) {}

  getStockMaster(
    search: FilterModel | null = null
  ): Observable<ResponseModel<StockModel>> {
    return this.http.get<ResponseModel<StockModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getStockById(id: string): Observable<StockModel> {
    return this.http.get<StockModel>(`${this.url}/${id}`);
  }

  getProductCatalog(
    search: FilterModel | null = null
  ): Observable<ResponseModel<ProductCatalogModel>> {
    return this.http.get<ResponseModel<ProductCatalogModel>>(
      `${this.url}/products${search ? search.asQueryString() : ''}`
    );
  }

  getExistence(
    search: FilterModel | null = null
  ): Observable<ResponseModel<ExistenceModel>> {
    return this.http.get<ResponseModel<ExistenceModel>>(
      `${this.url}/existence${search ? search.asQueryString() : ''}`
    );
  }

  registerInput(
    products: InventoryEntryCollectionModel
  ): Observable<StockModel> {
    return this.http.post<StockModel>(`${this.url}/input`, products);
  }

  registerOutput(products: InventoryOutputCollectionModel): Observable<void> {
    return this.http.post<void>(`${this.url}/output`, products);
  }

  updateInput(products: InventoryEntryCollectionModel): Observable<void> {
    return this.http.put<void>(`${this.url}/input`, products);
  }

  updateOutput(products: InventoryOutputCollectionModel): Observable<void> {
    return this.http.put<void>(`${this.url}/output`, products);
  }

  cancelStock(id: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/cancel`, {});
  }

  uploadAttachment(id: string, file: FormData): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/attachment/upload`, file);
  }

  getAttachments(stockId: string): Observable<StockAttachModel[]> {
    return this.http.get<StockAttachModel[]>(
      `${this.url}/${stockId}/attachments`
    );
  }

  downloadAttachments(attachmentId: string): Observable<Blob> {
    return this.http.post(
      `${this.url}/attachments/${attachmentId}/download`,
      {},
      { responseType: 'blob' }
    );
  }
}
