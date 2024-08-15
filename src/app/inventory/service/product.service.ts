import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ProductModel } from '../models/product.model';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';

@Injectable()
export class ProductService {
  url = `${environment.api_url}/inventory/products`;
  constructor(private http: HttpClient) {}

  getProducts(
    search: FilterModel | null = null
  ): Observable<ResponseModel<ProductModel>> {
    return this.http.get<ResponseModel<ProductModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getProductById(id: string): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${this.url}/${id}`);
  }

  addProduct(model: ProductModel): Observable<ProductModel> {
    return this.http.post<ProductModel>(`${this.url}`, model);
  }

  updateProduct(model: ProductModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }

  uploadFile(model: FormData): Observable<void> {
    return this.http.post<void>(`${this.url}/photo/upload`, model);
  }
}
